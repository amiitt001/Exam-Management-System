const mongoose = require('mongoose');
const { Schema } = mongoose;

const SeatingPlanSchema = new Schema({
  planName: { type: String, required: true },
  collegeName: { type: String, default: "College Name" },
  examName: { type: String, default: "Exam Name" },
  seatingPlan: { type: String, default: "Seating Plan" }, // <-- ADD THIS LINE
  planData: { type: Object, required: true },
  studentCount: { type: Number, required: true },
  roomList: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SeatingPlan', SeatingPlanSchema);