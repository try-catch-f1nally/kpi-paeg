const crypto = require('node:crypto');
const BlindedSignature = require('blind-signatures');

module.exports = class CentralElectionCommittee {
  constructor() {
    const keyPair = crypto.generateKeyPairSync('rsa', {modulusLength: 1024});
    this.publicKey = keyPair.publicKey;
    this.privateKey = keyPair.privateKey;
    this.key = BlindedSignature.keyGeneration();
    this.bulletinBox = [];
    this.candidateIdVoteNumberMap = {};
    this.registeredElectors = new Set();
    this.electorsWithSignedBulletins = new Set();
  }

  registerCandidate(candidate) {
    this.candidateIdVoteNumberMap[candidate] = 0;
  }

  registerElector(elector) {
    this.registeredElectors.add(elector.id);
  }

  receiveBulletin(signedBulletin) {
    this.bulletinBox.push(signedBulletin);
  }

  signBlindly(elector, blindedSets) {
    if (this.electorsWithSignedBulletins.has(elector.id)) {
      throw new Error(`${elector.id} has already received the signed bulletins`);
    }

    const bulletinSetIndexToSign = Math.round(Math.random() * (blindedSets.length - 1));

    const getSignedSet = (multiplierSets, bulletinSets) => {
      if (bulletinSets.length !== blindedSets.length - 1) {
        throw new Error(`Incorrect number of bulletin sets received from ${elector.id}`);
      }
      let signedSet;
      for (let i = 0, j = 0; i < blindedSets.length; i++) {
        const blindedSet = blindedSets[i];
        if (blindedSet.length !== Object.keys(this.candidateIdVoteNumberMap).length) {
          throw new Error(`Incorrect number of bulletins in blinded set #${i} received from elector ${elector.id}`);
        }

        if (i === bulletinSetIndexToSign) {
          signedSet = blindedSet.map((blinded) => BlindedSignature.sign({blinded, key: this.key}));
          continue;
        }

        const bulletinSet = bulletinSets[j];
        const multiplierSet = multiplierSets[j++];
        const candidates = new Set();
        for (let k = 0; k < blindedSet.length; k++) {
          const blinded = blindedSet[k];
          const bulletin = bulletinSet[k];
          const r = multiplierSet[k];
          const signed = BlindedSignature.sign({blinded, key: this.key});
          const unblinded = BlindedSignature.unblind({signed, N: this.key.keyPair.n.toString(), r});
          const verifyResult = BlindedSignature.verify2({unblinded, key: this.key, message: JSON.stringify(bulletin)});
          if (!verifyResult) {
            throw new Error(`Invalid bulletin #${k} in bulletin set #${j} received from ${elector.id}`);
          }
          if (!bulletin.id || !bulletin.candidate) {
            throw new Error(`Invalid format of bulletin #${k} in bulletin set #${j} received from ${elector.id}`);
          }
          if (!(bulletin.candidate in this.candidateIdVoteNumberMap)) {
            throw new Error(
              `Bulletin set #${j} contains bulletin #${k} with not registered candidate elected, received from ${elector.id}`
            );
          }
          if (candidates.has(bulletin.candidate)) {
            throw new Error(
              `Bulletin set #${j} has bulletins with the same candidate elected, received from ${elector.id}`
            );
          }
          candidates.add(bulletin.candidate);
        }
      }

      this.electorsWithSignedBulletins.add(elector.id);
      return signedSet;
    };

    return {bulletinSetIndexToSign, getSignedSet};
  }

  finishElection() {
    const errors = [];
    const bulletinIdCandidateMap = {};
    for (let i = 0; i < this.bulletinBox.length; i++) {
      const {unblinded, encryptedBulletin} = this.bulletinBox[i];
      try {
        const bulletinStr = crypto.privateDecrypt(this.privateKey, encryptedBulletin).toString();
        const verifyResult = BlindedSignature.verify2({unblinded, key: this.key, message: bulletinStr});
        if (!verifyResult) {
          throw new Error(`Invalid signature of bulletin #${i}`);
        }

        const bulletin = JSON.parse(bulletinStr);
        if (bulletin.id in bulletinIdCandidateMap) {
          throw new Error(`Bulletin with ID ${bulletin.id} already counted`);
        }

        bulletinIdCandidateMap[bulletin.id] = bulletin.candidate;
        this.candidateIdVoteNumberMap[bulletin.candidate]++;
      } catch (error) {
        errors.push(error.message);
      }
    }

    return {result: this.candidateIdVoteNumberMap, bulletinIdCandidateMap, errors};
  }
};
