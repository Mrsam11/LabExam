const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phoneNumber: String,
  education: String,
  experience: String
});

module.exports = mongoose.model('Resume', ResumeSchema);