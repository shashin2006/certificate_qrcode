const crypto = require('crypto');

// Configurable constants
const COLLEGE = "RMKCET";
const DEPARTMENT = "CSE";
const EVENT = "PROJEXPO";
const SESSION = "FEB26";   // You can change dynamically if needed
const TYPE = "PR";         // PR = Participation

function generateCertificateId(number) {
  const serial = String(number).padStart(3, '0');
  return `RMKCET-CSE-PROJEXPO-FEB26-PR-${serial}`;
}

function generateToken() {
  return crypto.randomBytes(8).toString('hex');
}

module.exports = { generateCertificateId, generateToken };
