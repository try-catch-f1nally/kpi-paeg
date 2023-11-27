const assert = require('node:assert/strict');
const Elector = require('./elector');

const electorA = new Elector('electorA');
const electorB = new Elector('electorB');
const electorC = new Elector('electorC');
const electorD = new Elector('electorD');
const candidates = ['candidate0', 'candidate1', 'candidate2'];

const electorsPublicKeys = [
  electorA.rsaKeyPair.publicKey,
  electorB.rsaKeyPair.publicKey,
  electorC.rsaKeyPair.publicKey,
  electorD.rsaKeyPair.publicKey
];

let bulletins = [
  electorA.createBulletin('candidate0', electorsPublicKeys),
  electorB.createBulletin('candidate1', electorsPublicKeys),
  electorC.createBulletin('candidate1', electorsPublicKeys),
  electorD.createBulletin('candidate0', electorsPublicKeys)
];

bulletins = electorA.decryptAndRemoveSalt(bulletins);
bulletins = electorB.decryptAndRemoveSalt(bulletins);
bulletins = electorC.decryptAndRemoveSalt(bulletins);
bulletins = electorD.decryptAndRemoveSalt(bulletins);

bulletins = electorA.decryptAndVerifySignature({bulletins});
bulletins = electorB.decryptAndVerifySignature(bulletins, electorA.elgamalKeyPair.publicKey);
bulletins = electorC.decryptAndVerifySignature(bulletins, electorB.elgamalKeyPair.publicKey);
bulletins = electorD.decryptAndVerifySignature(bulletins, electorC.elgamalKeyPair.publicKey);

const bulletinsA = electorA.verifySignatureAndCheckOwnBulletin(bulletins, electorD.elgamalKeyPair.publicKey);
const bulletinsB = electorB.verifySignatureAndCheckOwnBulletin(bulletins, electorD.elgamalKeyPair.publicKey);
const bulletinsC = electorC.verifySignatureAndCheckOwnBulletin(bulletins, electorD.elgamalKeyPair.publicKey);
assert.deepEqual(bulletinsA, bulletinsB);
assert.deepEqual(bulletinsA, bulletinsC);

const candidateVoteCountMap = candidates.reduce((acc, curr) => ((acc[curr] = 0), acc), {});
bulletinsA.forEach((bulletin) => candidateVoteCountMap[bulletin.toString()]++);
console.log('Results:');
console.table(candidateVoteCountMap);
