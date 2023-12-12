const RegistrationBureau = require('./registrationBureau.js');
const ElectionCommittee = require('./electionCommittee.js');
const Elector = require('./elector.js');
const Candidate = require('./candidate.js');
const Application = require('./application.js');

const electionCommittee = new ElectionCommittee();
const registrationBureau = new RegistrationBureau();

const application = new Application(electionCommittee, registrationBureau);

const candidate0 = new Candidate('candidate0');
const candidate1 = new Candidate('candidate1');
const candidate2 = new Candidate('candidate2');

electionCommittee.registerCandidate(candidate0);
electionCommittee.registerCandidate(candidate1);
electionCommittee.registerCandidate(candidate2);

const elector0 = new Elector('Edvard Earle', '12-12-2002');
const elector1 = new Elector('Gretta Clifford', '05-03-1998');
const elector2 = new Elector('Tiffani Lillie', '11-11-2001');
const elector3 = new Elector('Otis Errol', '09-12-1995');
const elector4 = new Elector('Lynton Trudie', '08-07-1984');
const elector5 = new Elector('Braiden Charlee', '12-05-1999');

const electors = [elector0, elector1, elector2, elector3, elector4, elector5];

// preparing
registrationBureau.generateIDs(electors.length);
registrationBureau.sendIDs(electionCommittee);
electionCommittee.sendTokens(registrationBureau);

// registration
electors.slice(0, 5).forEach((elector) => registrationBureau.registerElector(elector))

//voting
const proceedVoting = (login, password, token, candidateId) => {
    try {
        application.signIn(login, password);
        application.vote(token, candidateId);
    } catch (e) {
        console.log(e.message)
    }
}

proceedVoting(elector0.login, elector0.password, elector0.token, 'candidate0');
proceedVoting(elector1.login, elector1.password, elector1.token, 'candidate1');
proceedVoting(elector2.login, elector2.password, elector2.token, 'candidate0');
proceedVoting(elector3.login, elector3.password, elector3.token, 'candidate2');
proceedVoting(elector4.login, elector4.password, elector4.token, 'candidate3');
proceedVoting(elector5.login, elector5.password, elector5.token, 'candidate1');
proceedVoting(elector1.login, elector1.password, elector1.token, 'candidate0');

const errors = electionCommittee.processBulletins();
errors.forEach((error) => console.log(error));
console.table(electionCommittee.votes);
