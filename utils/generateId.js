const crypto = require('crypto');

function generateCertificateId(number) {
  return `BF26-CSE-${String(number).padStart(4, '0')}`;
}

function generateToken() {
  return crypto.randomBytes(8).toString('hex');
}

module.exports = { generateCertificateId, generateToken };