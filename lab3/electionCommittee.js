const elGamal = require('../lib/elgamal');
module.exports =  class ElectionCommittee {
  constructor() {
    this.registrationNumbers = [];
    this.voteMessages = [];
    this.voted = {};
    this.votes = {};
  }

  registerCandidate(candidate) {
    this.votes[candidate.id] = 0;
  }

  receiveFromRegistrationBureau(registrationNumbers) {
    this.registrationNumbers = registrationNumbers;
  }

  receiveVote({encrypted, x, p}) {
    const decrypted = elGamal.decrypt(encrypted, x, p);
    const voteMessage = JSON.parse(decrypted.toString());

    const registrationNumber = this.registrationNumbers.find((number) => number === voteMessage.registrationNumber);

    if (!registrationNumber)
        throw new Error(`Elector with registration number: ${voteMessage.registrationNumber} is not allowed to vote!`);

    if (!Object.keys(this.votes).find((candidate) => candidate === voteMessage.bulletin))
      throw new Error(`Candidate ${voteMessage.bulletin} is not registered!`);

    this.registrationNumbers = this.registrationNumbers.filter((number) => number !== registrationNumber);
    this.voted[voteMessage.id] = voteMessage.bulletin;
    this.votes[voteMessage.bulletin]++;
  }
}
