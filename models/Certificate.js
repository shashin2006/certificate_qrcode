const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: String,
  name: String,
  department: String,
  event: String,
  issuedDate: Date,
  token: String,
  imageUrl: String
});

module.exports = mongoose.model("Certificate", certificateSchema);
