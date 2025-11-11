const mongoose = require('mongoose');
const { Schema } = mongoose;

const SeatingPlanSchema = new Schema({
  // e.g., "B.Tech CSE 2nd Year Mid-Term"
  planName: {
    type: String,
    required: true,
    default: () => `Seating Plan ${new Date().toLocaleDateString()}`
  },
  // The final assignment, e.g., { "Room 101": ["R001", "R002"] }
  planData: {
    type: Object,
    required: true
  },
  // The raw lists used to generate the plan
  studentCount: {
    type: Number,
    required: true
  },
  roomList: {
    type: Array,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SeatingPlan', SeatingPlanSchema);