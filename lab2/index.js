const CentralElectionCommittee = require('./centralElectionCommittee');
const Elector = require('./elector');

const centralElectionCommittee = new CentralElectionCommittee();
const elector0 = new Elector('elector0');
const elector1 = new Elector('elector1');
const elector2 = new Elector('elector2');
const elector3 = new Elector('elector3');
const elector4 = new Elector('elector4');
const elector5 = new Elector('elector5');
const registeredCandidates = ['candidate0', 'candidate1', 'candidate2'];
registeredCandidates.forEach((c) => centralElectionCommittee.registerCandidate(c));
centralElectionCommittee.registerElector(elector0);
centralElectionCommittee.registerElector(elector1);
centralElectionCommittee.registerElector(elector2);
centralElectionCommittee.registerElector(elector3);
centralElectionCommittee.registerElector(elector4);

const {key, publicKey} = centralElectionCommittee;
console.log('Errors during electing process:');

const blindedSets0 = elector0.createBulletinSets(registeredCandidates, key);
const response0 = centralElectionCommittee.signBlindly(elector0, blindedSets0);
const bulletin0 = elector0.elect(response0, 'candidate0', publicKey);
centralElectionCommittee.receiveBulletin(bulletin0);

const blindedSets1 = elector1.createBulletinSets(registeredCandidates, key);
const response1 = centralElectionCommittee.signBlindly(elector1, blindedSets1);
const bulletin1 = elector1.elect(response1, 'candidate1', publicKey);
centralElectionCommittee.receiveBulletin(bulletin1);

const blindedSets2 = elector2.createBulletinSets(registeredCandidates, key);
const response2 = centralElectionCommittee.signBlindly(elector2, blindedSets2);
const bulletin2 = elector2.elect(response2, 'candidate1', publicKey);
centralElectionCommittee.receiveBulletin(bulletin2);

const blindedSets3 = elector3.createBulletinSets(registeredCandidates, key);
const response3 = centralElectionCommittee.signBlindly(elector3, blindedSets3.slice(0, -1));
printError(() => elector3.elect(response3, 'candidate1', publicKey)); // err: incorrect number of bulletins in bulletin set

// make one bulletin with two candidates
const blindedSets4 = elector4.createBulletinSets([...registeredCandidates.slice(1), 'candidate1'], key);
const response4 = centralElectionCommittee.signBlindly(elector4, blindedSets4);
printError(() => elector4.elect(response4, 'candidate1', publicKey)); // err: two bulletins with same candidate

// make one bulletin with not registered candidate
const blindedSets5 = elector5.createBulletinSets([...registeredCandidates.slice(0, -1), 'candidate3'], key);
const response5 = centralElectionCommittee.signBlindly(elector5, blindedSets5); // err: one bulletin with not registered candidate
printError(() => elector5.elect(response5, 'candidate1', publicKey));

printError(() => centralElectionCommittee.signBlindly(elector0, blindedSets0)); // err: request to sign second time

// send one bulletin with invalid signature
centralElectionCommittee.receiveBulletin({
  unblinded: bulletin0.unblinded,
  encryptedBulletin: bulletin1.encryptedBulletin
});

// send bulletin twice
centralElectionCommittee.receiveBulletin(bulletin0);

const {result, bulletinIdCandidateMap, errors} = centralElectionCommittee.finishElection();
console.log('\nResult:');
console.table(result);
console.log('\nBulletins:');
console.table(bulletinIdCandidateMap);
console.log('\nErrors:');
errors.forEach((err) => console.log('\t', err));

function printError(fn) {
  try {
    fn();
  } catch (err) {
    console.log('\t', err.message);
  }
}
