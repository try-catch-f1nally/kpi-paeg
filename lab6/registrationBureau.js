const crypto = require("node:crypto");

module.exports = class RegistrationBureau {
  constructor() {
    this.registrationNumbers = [];
    this.tokens = [];
    this.credentials = {};
  }

  generateIDs(amount) {
    for (let i = 0; i < amount; i++) {
      const registrationNumber = Math.floor(100000 + Math.random() * 900000).toString();
      this.registrationNumbers.push(registrationNumber);
    }
  }

  sendIDs(electionCommittee) {
    electionCommittee.receiveIDs(this.registrationNumbers);
  }

  receiveTokens(tokens) {
    this.tokens = [...tokens];
  }

  registerElector(elector) {
    const login = crypto.randomBytes(5).toString('hex');
    const password = crypto.randomBytes(8).toString('hex');
    this.credentials[login] = password;
    const token = this.tokens.pop();
    elector.receiveRegistrationData(login, password, token);
  }
}
