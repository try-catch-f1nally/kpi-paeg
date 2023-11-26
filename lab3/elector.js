const crypto = require('crypto');
const elGamal = require('../lib/elgamal');
module.exports =  class Elector {
  constructor(id) {
    this.id = id;
    this.registrationNumber = null;
    const {privateKey, publicKey} = elGamal.generateKeyPair();
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  requestRegistrationNumber(bureau) {
    return bureau.registerElector(this);
  }

  receiveRegistrationNumber(registrationNumber) {
    this.registrationNumber = registrationNumber;
  }

  createVoteMessage(candidateId) {
    const id = crypto.randomBytes(16).toString('hex');
    const message = {id, registrationNumber: this.registrationNumber, bulletin: candidateId};
    return {encrypted: elGamal.encrypt(JSON.stringify(message), this.publicKey), x: this.privateKey.x, p: this.publicKey.p};
  }
}
