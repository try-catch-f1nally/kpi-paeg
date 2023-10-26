const CentralElectionCommittee = require('./centralElectionCommittee');
const Candidate = require('./candidate');
const Elector = require('./elector');

const centralElectionCommittee = new CentralElectionCommittee();

const candidate0 = new Candidate('candidate0');
const candidate1 = new Candidate('candidate1');
const candidate2 = new Candidate('candidate2');

const elector0 = new Elector('elector0');
const elector1 = new Elector('elector1');
const elector2 = new Elector('elector2');
const elector3 = new Elector('elector3');
const elector4 = new Elector('elector4');
const elector5 = new Elector('elector5');

centralElectionCommittee.registerCandidate(candidate0);
centralElectionCommittee.registerCandidate(candidate1);
centralElectionCommittee.registerCandidate(candidate2);

centralElectionCommittee.registerElector(elector0);
centralElectionCommittee.registerElector(elector1);
centralElectionCommittee.registerElector(elector2);
centralElectionCommittee.registerElector(elector3);
centralElectionCommittee.registerElector(elector4);

const {gamma} = centralElectionCommittee;
const bulletin0 = elector0.elect('candidate0', gamma);
const bulletin1 = elector1.elect('candidate1', gamma);
const bulletin2 = elector2.elect('candidate1', gamma);
const bulletin3 = elector3.elect('candidate3', gamma);
const bulletin4 = elector4.elect('candidate1', gamma);
const bulletin5 = elector5.elect('candidate0', gamma);
const bulletin6 = elector0.elect('candidate0', gamma);

centralElectionCommittee.receiveSignedBulletin(bulletin0, elector0.publicKey); // ok
centralElectionCommittee.receiveSignedBulletin(bulletin1, elector1.publicKey); // ok
centralElectionCommittee.receiveSignedBulletin(bulletin2, elector2.publicKey); // ok
centralElectionCommittee.receiveSignedBulletin(bulletin3, elector3.publicKey); // error: vote for not registered/existing candidate
centralElectionCommittee.receiveSignedBulletin(bulletin4, elector0.publicKey); // error: invalid signature
centralElectionCommittee.receiveSignedBulletin(bulletin5, elector5.publicKey); // error: not registered elector
centralElectionCommittee.receiveSignedBulletin(bulletin6, elector0.publicKey); // error: vote second time

const fakedBulletin = {signature: bulletin5.signature, encryptedBulletin: bulletin1.encryptedBulletin};
centralElectionCommittee.receiveSignedBulletin(fakedBulletin, elector1.publicKey); // error: faked bulletin

const {result, electorsWhoseVotesAreCounted, errors} = centralElectionCommittee.finishElection();
console.log('\nResult:');
console.table(result);
console.log('\nElectors, whose votes are counted:', electorsWhoseVotesAreCounted.join(', '));
console.log('\nErrors:');
errors.forEach((err) => console.log('\t', err));
