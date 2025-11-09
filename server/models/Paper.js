const mongoose = require("mongoose");

const PaperSchema = new mongoose.Schema({
  subject: String,
  syllabus: String,
  difficulty: String,
  count: Number,
  format: String,
  questions: Array,
  answerKey: Array,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Paper", PaperSchema);
