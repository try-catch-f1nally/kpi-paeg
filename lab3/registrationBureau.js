module.exports = class RegistrationBureau {
  constructor() {
    this.registrationNumbers = {};
  }

  registerElector(elector) {
    const registrationNumber = Math.floor(Math.random() * 1000000).toString();
    this.registrationNumbers[registrationNumber] = elector.id;
    return registrationNumber;
  }

  sendToElectionCommittee(electionCommittee) {
    electionCommittee.receiveFromRegistrationBureau(Object.keys(this.registrationNumbers));
  }
}
