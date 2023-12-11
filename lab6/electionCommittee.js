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
    this.voteMessages.forEach((voteMessage) => {
      const {id, message, x0} = JSON.parse(ElGamal.decrypt(voteMessage, this.#privateKey, this.publicKey));
      const decrypted = BlumBlumShub.decrypt(message, x0, this.electorsKeys[id]);
    });
  }
}
