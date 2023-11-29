const Candidate = require('./candidate');
const Elector = require('./elector');
const ElectionCommittee = require('./electionCommittee');
const CentralElectionCommittee = require('./centralElectionCommittee');

const elector0 = new Elector();
const elector1 = new Elector();
const elector2 = new Elector();
const elector3 = new Elector();
const elector4 = new Elector();
const elector5 = new Elector();

const candidate0 = new Candidate();
const candidate1 = new Candidate();
const candidate2 = new Candidate();

const electionCommittee1 = new ElectionCommittee();
const electionCommittee2 = new ElectionCommittee();

const centralElectionCommittee = new CentralElectionCommittee();

// register electors
const electors = [elector0, elector1, elector2, elector3, elector4];
elector5.id = '123456'; // break one elector
electors.map((elector) => centralElectionCommittee.registerElector(elector));

// register candidates
const candidates = [candidate0, candidate1, candidate2];
candidates.map((candidate) => centralElectionCommittee.registerCandidate(candidate));

// create vote-messages
const bulletins0 = elector0.vote(candidate0.id, centralElectionCommittee.publicKey);
const bulletins1 = elector1.vote(candidate1.id, centralElectionCommittee.publicKey);
const bulletins2 = elector2.vote(candidate1.id, centralElectionCommittee.publicKey);
const bulletins3 = elector3.vote(123456, centralElectionCommittee.publicKey); // err: not registered candidate
const bulletins4 = elector4.vote(candidate1.id, centralElectionCommittee.publicKey);
const bulletins5 = elector5.vote(candidate0.id, centralElectionCommittee.publicKey);
const bulletins6 = elector0.vote(candidate0.id, centralElectionCommittee.publicKey); // err: voting twice

const receiveVote = ({firstEncrypted, secondEncrypted, id, signature}, elector) => {
  try {
    electionCommittee1.receiveVote({encryptedBulletin: firstEncrypted, id, signature}, elector.publicKey);
    electionCommittee2.receiveVote({encryptedBulletin: secondEncrypted, id, signature}, elector.publicKey);
  } catch (e) {
    console.log(e.message);
  }
}

receiveVote(bulletins0, elector0); // ok
receiveVote(bulletins1, elector1); // ok
receiveVote(bulletins2, elector2); // ok
receiveVote(bulletins3, elector3); // error: vote for not registered/existing candidate
receiveVote(bulletins4, elector0); // error: invalid signature
receiveVote(bulletins5, elector5); // error: not registered elector
receiveVote(bulletins6, elector0); // error: vote second time

centralElectionCommittee.receiveBulletins(electionCommittee1.bulletins, electionCommittee2.bulletins);
const errors = centralElectionCommittee.processBulletins();
errors.forEach((error) => console.log(error));

console.log('Results:');
console.table(centralElectionCommittee.results);

console.log('Votes:');
console.table(centralElectionCommittee.votes);
