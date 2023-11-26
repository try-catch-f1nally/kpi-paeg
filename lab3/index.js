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
const elector5 = new Elector('elector5');

const electors = [elector0, elector1, elector2, elector3, elector4, elector5];

const candidate0 = new Candidate('candidate0');
const candidate1 = new Candidate('candidate1');
const candidate2 = new Candidate('candidate2');

// Реєстрація кандидатів
electionCommittee.registerCandidate(candidate0);
electionCommittee.registerCandidate(candidate1);
electionCommittee.registerCandidate(candidate2);

// Отримання реєстраційного номеру
electors.forEach((elector) => {
    const registrationNumber = elector.requestRegistrationNumber(registrationBureau);
    elector.receiveRegistrationNumber(registrationNumber);
  }
)

// Відправлення реєстраційних номерів у ВК
registrationBureau.sendToElectionCommittee(electionCommittee);

const bulletin0 = elector0.createVoteMessage('candidate0');
const bulletin1 = elector1.createVoteMessage('candidate1');
const bulletin2 = elector2.createVoteMessage('candidate1');
const bulletin3 = elector3.createVoteMessage('candidate3'); // err: not registered candidate
const bulletin4 = elector4.createVoteMessage('candidate1');
const bulletin5 = elector5.createVoteMessage('candidate0');
const bulletin6 = elector0.createVoteMessage('candidate0'); // err: voting twice

[bulletin0, bulletin1, bulletin2, bulletin3, bulletin4, bulletin5, bulletin6].forEach(async (bulletin) => {
  try {
    await electionCommittee.receiveVote(bulletin);
  } catch (e) {
    console.log(e.message);
  }
})


console.log("Results:");
console.table(electionCommittee.votes);

console.log("Voted list:");
console.table(electionCommittee.voted);
