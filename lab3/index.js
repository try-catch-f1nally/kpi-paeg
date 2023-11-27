const RegistrationBureau = require('./registrationBureau.js');
const ElectionCommittee = require('./electionCommittee.js');
const Elector = require('./elector.js');
const Candidate = require('./candidate.js');

const registrationBureau = new RegistrationBureau();
const electionCommittee = new ElectionCommittee();

const elector0 = new Elector('elector0');
const elector1 = new Elector('elector1');
const elector2 = new Elector('elector2');
const elector3 = new Elector('elector3');
const elector4 = new Elector('elector4');
const elector5 = new Elector('elector5'); // unregistered

const electorsToRegister = [elector0, elector1, elector2, elector3, elector4];

const candidate0 = new Candidate('candidate0');
const candidate1 = new Candidate('candidate1');
const candidate2 = new Candidate('candidate2');

// Реєстрація кандидатів
electionCommittee.registerCandidate(candidate0);
electionCommittee.registerCandidate(candidate1);
electionCommittee.registerCandidate(candidate2);

// Отримання реєстраційного номеру
electorsToRegister.forEach((elector) => {
    const registrationNumber = elector.requestRegistrationNumber(registrationBureau);
    elector.receiveRegistrationNumber(registrationNumber);
  }
)

// Відправлення реєстраційних номерів у ВК
registrationBureau.sendToElectionCommittee(electionCommittee);

const bulletin0 = elector0.createVoteMessage('candidate0', electionCommittee.publicKey);
const bulletin1 = elector1.createVoteMessage('candidate1', electionCommittee.publicKey);
const bulletin2 = elector2.createVoteMessage('candidate1', electionCommittee.publicKey);
const bulletin3 = elector3.createVoteMessage('candidate3', electionCommittee.publicKey); // err: not registered candidate
const bulletin4 = elector4.createVoteMessage('candidate1', electionCommittee.publicKey);
const bulletin5 = elector5.createVoteMessage('candidate0', electionCommittee.publicKey);
const bulletin6 = elector0.createVoteMessage('candidate0', electionCommittee.publicKey); // err: voting twice

// Голосування
const receiveVote = (bulletin, elector) => {
  try {
    electionCommittee.receiveVote(bulletin, elector.publicKey)
  } catch (e) {
    console.log(e.message);
  }
}

receiveVote(bulletin0, elector0); // ok
receiveVote(bulletin1, elector1); // ok
receiveVote(bulletin2, elector2); // ok
receiveVote(bulletin3, elector3); // error: vote for not registered/existing candidate
receiveVote(bulletin4, elector0); // error: invalid signature
receiveVote(bulletin5, elector5); // error: not registered elector
receiveVote(bulletin6, elector0); // error: vote second time

console.log("Results:");
console.table(electionCommittee.votes);

console.log("Voted list:");
console.table(electionCommittee.voted);
