const ElGamal = require('../lib/elgamal.js');
const BlumBlumShub = require('../lib/blumBlumShub.js');

module.exports = class ElectionCommittee {
  #privateKey;
  electorsKeys;

  constructor() {
    const {privateKey, publicKey} = ElGamal.generateKeyPair();
    this.#privateKey = privateKey;
    this.publicKey = publicKey;
    this.electorsKeys = {};
    this.tokens = [];
    this.votes = {};
    this.voteMessages = [];
    this.alreadyVoted = [];
  }

  receiveIDs(IDs) {
    for (let id of IDs) {
      const {privateKey, publicKey} = BlumBlumShub.generateKeyPair();
      this.electorsKeys[id] = {privateKey};
      this.tokens.push({id, publicKey});
    }
  }

  sendTokens(registrationBureau) {
    registrationBureau.receiveTokens(this.tokens);
  }

  registerCandidate(candidate) {
    this.votes[candidate.id] = 0;
  }

  receiveVoteMessage(message) {
    this.voteMessages.push(message);
  }

  processBulletins() {
    const errors = [];
    this.voteMessages.forEach((voteMessage) => {
      const {message, x0, id} = JSON.parse(ElGamal.decrypt(voteMessage, this.#privateKey, this.publicKey));
      const bulletin = BlumBlumShub.decrypt(message, x0, this.electorsKeys[id]['privateKey']);
      try {
        if (!Object.keys(this.votes).find((element) => element === bulletin))
          throw new Error('Vote for unregistered candidate!');
        if (this.alreadyVoted.find((element) => element === id)) throw new Error('Elector has already voted!');
        this.votes[bulletin]++;
        this.alreadyVoted.push(id);
      } catch (err) {
        errors.push(err.message);
      }
    });
    return errors;
  }
}
