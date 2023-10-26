const crypto = require('node:crypto');

module.exports = class CentralElectionCommittee {
  constructor() {
    this.gamma = crypto.randomBytes(16);
    this.bulletinBox = [];
    this.publicKeyElectorIdMap = {};
    this.candidateIdVoteNumberMap = {};
  }

  registerCandidate(candidate) {
    this.candidateIdVoteNumberMap[candidate.id] = 0;
  }

  registerElector(elector) {
    this.publicKeyElectorIdMap[elector.publicKey.toString('hex')] = elector.id;
  }

  receiveSignedBulletin(signedBulletin, publicKey) {
    this.bulletinBox.push({signedBulletin, publicKey});
  }

  finishElection() {
    const electorsWhoseVotesAreCounted = [];
    const errors = [];
    for (const {signedBulletin, publicKey} of this.bulletinBox) {
      try {
        const {signature, encryptedBulletin} = signedBulletin;
        const bulletinBuffer = encryptedBulletin.map((byte, i) => byte ^ this.gamma[i % this.gamma.length]);
        const actualHash = crypto.createHash('sha256').update(bulletinBuffer).digest();
        let expectedHash;
        try {
          expectedHash = crypto.publicDecrypt(publicKey, signature);
        } catch {
          throw new Error(`Invalid signature`);
        }
        if (!expectedHash.equals(actualHash)) {
          throw new Error(`Faked bulletin`);
        }

        const electorId = this.publicKeyElectorIdMap[publicKey.toString()];
        if (!electorId) {
          throw new Error(`Elector is not registered`);
        }
        if (electorsWhoseVotesAreCounted.includes(electorId)) {
          throw new Error(`Elector ${electorId} has tried to vote twice`);
        }

        const candidateId = bulletinBuffer.toString();
        if (!(candidateId in this.candidateIdVoteNumberMap)) {
          throw new Error(`Elector ${electorId} has voted for not existed/registered candidate`);
        }

        electorsWhoseVotesAreCounted.push(electorId);
        this.candidateIdVoteNumberMap[candidateId]++;
      } catch (error) {
        errors.push(error.message);
      }
    }

    return {result: this.candidateIdVoteNumberMap, electorsWhoseVotesAreCounted, errors};
  }
};
