const crypto = require('node:crypto');
const ElGamal = require('../lib/elgamal');

module.exports = class Elector {
  constructor(id) {
    this.id = id;
    this.encryptedBulletinSet = new Set();
    this.saltSet = new Set();
    this.elgamalKeyPair = ElGamal.generateKeyPair();
    this.rsaKeyPair = crypto.generateKeyPairSync('rsa', {modulusLength: 1024});
  }

  createBulletin(candidate, electorsPublicKeys) {
    this.salt1 = crypto.randomBytes(8);
    let bulletin = Buffer.concat([this.salt1, Buffer.from(candidate)]);
    for (let i = electorsPublicKeys.length - 1; i >= 0; i--) {
      bulletin = this._encrypt(bulletin, electorsPublicKeys[i]);
      this.encryptedBulletinSet.add(bulletin.toString('hex'));
    }
    for (let i = electorsPublicKeys.length - 1; i >= 0; i--) {
      const salt = crypto.randomBytes(8);
      this.saltSet.add(salt.toString('hex'));
      bulletin = this._encrypt(Buffer.concat([salt, bulletin]), electorsPublicKeys[i]);
    }
    return bulletin;
  }

  decryptAndRemoveSalt(bulletins) {
    const processedBulletins = [];
    let isOwnBulletinFound = false;
    for (const encryptedBulletin of bulletins) {
      const decrypted = this._decrypt(encryptedBulletin, this.rsaKeyPair.privateKey);
      const salt = decrypted.subarray(0, 8);
      const bulletin = decrypted.subarray(8);
      isOwnBulletinFound ||= this.saltSet.has(salt.toString('hex'));
      processedBulletins.push(bulletin);
    }
    if (!isOwnBulletinFound) {
      throw new Error(`${this.id}: Own bulletin not found`);
    }
    return processedBulletins.sort(() => Math.random() - 0.5);
  }

  decryptAndVerifySignature(signedBulletins, publicKey) {
    if (signedBulletins.signature) {
      this._verifySignedBulletins(signedBulletins, publicKey);
    }
    const processedBulletins = [];
    let isOwnBulletinFound = false;
    for (const encryptedBulletin of signedBulletins.bulletins) {
      isOwnBulletinFound ||= this.encryptedBulletinSet.has(encryptedBulletin.toString('hex'));
      const bulletin = this._decrypt(encryptedBulletin, this.rsaKeyPair.privateKey);
      processedBulletins.push(bulletin);
    }
    if (!isOwnBulletinFound) {
      throw new Error(`${this.id}: Own bulletin not found`);
    }
    return {
      bulletins: processedBulletins.sort(() => Math.random() - 0.5),
      signature: this._signBulletins(processedBulletins)
    };
  }

  verifySignatureAndCheckOwnBulletin(signedBulletins, publicKey) {
    this._verifySignedBulletins(signedBulletins, publicKey);
    let isOwnBulletinFound = false;
    const processedBulletins = [];
    for (const bulletinWithSalt of signedBulletins.bulletins) {
      const salt = bulletinWithSalt.subarray(0, 8);
      const bulletin = bulletinWithSalt.subarray(8);
      isOwnBulletinFound ||= this.salt1.equals(salt);
      processedBulletins.push(bulletin);
    }
    if (!isOwnBulletinFound) {
      throw new Error(`${this.id}: Own bulletin not found`);
    }
    return processedBulletins;
  }

  _signBulletins(bulletins) {
    return ElGamal.sign(Buffer.concat(bulletins), this.elgamalKeyPair.publicKey, this.elgamalKeyPair.privateKey);
  }

  _verifySignedBulletins({bulletins, signature}, publicKey) {
    if (!ElGamal.verify(Buffer.concat(bulletins), signature, publicKey)) {
      throw new Error('Signature verification failed');
    }
  }

  _encrypt(data, publicKey) {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encryptedData = Buffer.concat([iv, cipher.update(data), cipher.final()]);
    const encryptedKey = crypto.publicEncrypt(publicKey, key);
    return Buffer.from(
      JSON.stringify({
        encryptedKeyHex: encryptedKey.toString('hex'),
        encryptedDataHex: encryptedData.toString('hex')
      })
    );
  }

  _decrypt(data, privateKey) {
    const parsed = JSON.parse(data.toString());
    const encryptedKey = Buffer.from(parsed.encryptedKeyHex, 'hex');
    const encryptedData = Buffer.from(parsed.encryptedDataHex, 'hex');
    const key = crypto.privateDecrypt(privateKey, encryptedKey);
    const iv = encryptedData.subarray(0, 16);
    const encrypted = encryptedData.subarray(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }
};
