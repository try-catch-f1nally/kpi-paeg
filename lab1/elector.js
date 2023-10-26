const crypto = require('node:crypto');

module.exports = class Elector {
  #privateKey;

  constructor(id) {
    this.id = id;
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 1024,
      privateKeyEncoding: {format: 'pem', type: 'pkcs1'},
      publicKeyEncoding: {format: 'pem', type: 'pkcs1'}
    });
    this.#privateKey = keyPair.privateKey;
    this.publicKey = keyPair.publicKey;
  }

  elect(candidateId, gamma) {
    const hash = crypto.createHash('sha256').update(candidateId).digest();
    const signature = crypto.privateEncrypt(this.#privateKey, hash);
    const encryptedBulletin = Buffer.from(candidateId).map((byte, i) => byte ^ gamma[i % gamma.length]);
    return {signature, encryptedBulletin};
  }
};
