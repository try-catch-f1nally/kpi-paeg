const crypto = require('node:crypto');
const {BigInteger} = require('jsbn');

/**
 * @typedef {import('jsbn').BigInteger} BigInteger
 */

/**
 * @typedef PublicKey
 * @property {BigInteger} p - p
 * @property {BigInteger} g - g
 * @property {BigInteger} y - y
 */

/**
 * @typedef PrivateKey
 * @property {BigInteger} x - x
 */

/**
 * @typedef Signature
 * @property {BigInteger} r - r
 * @property {BigInteger} s - s
 */

module.exports = class ElGamal {
  /**
   * @returns {{publicKey: PublicKey, privateKey: PrivateKey}}
   */
  static generateKeyPair() {
    const p = numberToBigInteger(generateRandomPrimeInt(1, 1000));
    const g = numberToBigInteger(generateRandomPrimeInt(1, p.intValue()));
    const x = numberToBigInteger(generateRandomInt(1, p.intValue() - 2));
    const y = numberToBigInteger(g.modPow(x, p));
    return {
      publicKey: {p, g, y},
      privateKey: {x}
    };
  }

  /**
   * @param {string | Buffer} data
   * @param {PublicKey} publicKey
   * @param {PrivateKey} privateKey
   * @returns {Signature}
   */
  static sign(data, publicKey, privateKey) {
    const {p, g} = publicKey;
    const {x} = privateKey;
    const m = getHashBigInt(data);
    const pMinus1Int = p.intValue() - 1;
    const pMinus1 = numberToBigInteger(pMinus1Int);
    const k = numberToBigInteger(generateRandomCoprimeInt(pMinus1Int));
    const r = g.modPow(k, p);
    const s = m.subtract(x.multiply(r)).multiply(k.modInverse(pMinus1)).mod(pMinus1);
    return {r, s};
  }

  /**
   * @param {string | Buffer} data
   * @param {Signature} signature
   * @param {PublicKey} publicKey
   * @returns {boolean}
   */
  static verify(data, signature, publicKey) {
    const {p, g, y} = publicKey;
    const {r, s} = signature;
    if (r.compareTo(0) <= 0 || r.compareTo(p) >= 0 || s.compareTo(0) <= 0 || s.compareTo(p) >= 0) {
      throw new Error('Invalid signature');
    }
    const m = getHashBigInt(data);
    return y.pow(r).multiply(r.pow(s)).mod(p).equals(g.modPow(m, p));
  }
};

/**
 * @param {number} num
 * @returns {BigInteger}
 */
function numberToBigInteger(num) {
  return new BigInteger(num.toString());
}

/**
 * @param {string | Buffer} data
 * @returns {BigInteger}
 */
function getHashBigInt(data) {
  return new BigInteger(crypto.createHash('md5').update(data).digest('hex').slice(0, 4), 16);
}

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function generateRandomInt(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function generateRandomPrimeInt(min, max) {
  const randomInt = generateRandomInt(min, max);
  return isPrime(randomInt) ? randomInt : generateRandomPrimeInt(min, max);
}

/**
 * @param {number} num
 * @returns {number}
 */
function generateRandomCoprimeInt(num) {
  const randomInt = generateRandomInt(1, num - 1);
  return areCoprime(num, randomInt) ? randomInt : generateRandomCoprimeInt(num);
}

/**
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
function areCoprime(a, b) {
  return gcd(a, b) === 1;
}

/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * @param {number} num
 * @returns {boolean}
 */
function isPrime(num) {
  if (num <= 1) {
    return false;
  }
  for (let i = 2; i < num; i++) {
    if (num % i === 0) {
      return false;
    }
  }
  return true;
}
