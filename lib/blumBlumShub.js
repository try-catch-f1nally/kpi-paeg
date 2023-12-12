const {BigInteger} = require('jsbn');

/**
 * @typedef {import('jsbn').BigInteger} BigInteger
 */

/**
 * @typedef PrivateKey
 * @property {number} p - p
 * @property {number} q - q
 */

/**
 * @typedef PublicKey
 * @property {number} n - n
 */

module.exports = class BlumBlumShub {
  /**
   * @returns {{publicKey: PublicKey, privateKey: PrivateKey}}
   */
  static generateKeyPair() {
    const p = generateCongruent3mod4();
    const q = generateCongruent3mod4();
    const n = p * q;
    return {publicKey: {n}, privateKey: {p, q}};
  }

  /**
   * @param {string} message
   * @param {PublicKey} publicKey
   * @returns {{message: string, x0: number}}
   */
  static encrypt(message, publicKey) {
    const n = numberToBigInteger(publicKey.n);
    const x = numberToBigInteger(generateRandomCoprimeInt(n));
    const x0 = x.modPow(numberToBigInteger(2), n);
    const binaryChars = convertToBinary(message);
    const generator = this.generateSequence(binaryChars.length, x0, n);
    const encrypted = binaryChars.map((char, i) => {
      return (parseInt(char, 2) ^ parseInt(generator[i], 2));
    });
    return {message: convertToText(encrypted), x0: x0.intValue()};
  }

  /**
   * @param {string} message
   * @param {number} x0
   * @param {PrivateKey} privateKey
   * @returns {string}
   */
  static decrypt(message, x0, privateKey) {
    const p = numberToBigInteger(privateKey.p);
    const q = numberToBigInteger(privateKey.q);
    const n = p.multiply(q);
    const binaryChars = convertToBinary(message);
    const decrypted = binaryChars.map((char, i) => {
      const pMinus1Int = p.intValue() - 1;
      const qMinus1Int = q.intValue() - 1;
      const pMinus1 = numberToBigInteger(pMinus1Int);
      const qMinus1 = numberToBigInteger(qMinus1Int);
      const power = numberToBigInteger(2).modPow(numberToBigInteger(i + 1), pMinus1.multiply(qMinus1));
      const generated = numberToBigInteger(x0).modPow(power, n);
      return (parseInt(char, 2) ^ parseInt(generated.toString(2),2));
    });
    return convertToText(decrypted);
  }

  /**
   * @param {number} length
   * @param {BigInteger} x0
   * @param {BigInteger} n
   * @returns {string[]}
   */
  static generateSequence(length, x0, n) {
    let xPrevious = x0;
    const generator = [];
    for (let i = 0; i < length; i++) {
      let xCurrent = xPrevious.modPow(numberToBigInteger(2), n);
      generator.push(xCurrent.intValue().toString(2));
      xPrevious = xCurrent;
    }
    return generator;
  }
}

/**
 * @param {string} text
 * @returns {string[]}
 */
function convertToBinary(text) {
  return text.split('').map((char) => char.charCodeAt(0).toString(2));
}

/**
 * @param {string[]} binary
 * @returns {string}
 */
function convertToText(binary) {
  return binary.map((char) => String.fromCharCode(parseInt(char, 10))).join('');
}

/**
 * @returns {number}
 */
function generateRandomInt() {
  return Math.floor(10 + Math.random() * 90)
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

/**
 * @returns {number}
 */
function generateRandomPrimeInt() {
  const randomInt = generateRandomInt();
  return isPrime(randomInt) ? randomInt : generateRandomPrimeInt();
}

/**
 * @returns {number}
 */
function generateCongruent3mod4() {
  const primeInt = generateRandomPrimeInt();
  return primeInt % 4 === 3 ? primeInt : generateCongruent3mod4();
}

/**
 * @param {number} num
 * @returns {BigInteger}
 */
function numberToBigInteger(num) {
  return new BigInteger(num.toString());
}

/**
 * @param {number} num
 * @returns {number}
 */
function generateRandomCoprimeInt(num) {
  const randomInt = generateRandomInt();
  return areCoprime(num, randomInt) && randomInt < num ? randomInt : generateRandomCoprimeInt(num);
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
