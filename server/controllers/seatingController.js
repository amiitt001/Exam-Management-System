const SeatingPlan = require("../models/SeatingPlan");
const shuffleArray = require("../utils/shuffleArray");
const PDFDocument = require("pdfkit");

/**
 * @route   POST /api/generate-seating
 * @desc    Creates a new seating plan from student/room lists, saves to DB
 */
exports.generateSeatingPlan = async (req, res) => {
  try {
    let { studentList, roomList } = req.body;

    // --- 1. Validation ---
    const totalCapacity = roomList.reduce((sum, room) => sum + parseInt(room.capacity, 10), 0);
    const totalStudents = studentList.length;

    if (totalStudents === 0) {
      return res.status(400).json({ message: "Student list is empty." });
    }
    if (totalCapacity < totalStudents) {
      return res.status(400).json({ message: `Error: Not enough seats. ${totalStudents} students, but only ${totalCapacity} seats.` });
    }

    // --- 2. Core Algorithm ---
    const shuffledStudents = shuffleArray([...studentList]);
    const seatingPlan = {};
    let studentIndex = 0;

    for (const room of roomList) {
      const roomName = room.name;
      const capacity = parseInt(room.capacity, 10);
      seatingPlan[roomName] = [];

      for (let i = 0; i < capacity; i++) {
        if (studentIndex < totalStudents) {
          seatingPlan[roomName].push(shuffledStudents[studentIndex]);
          studentIndex++;
        } else {
          break;
        }
      }
      if (studentIndex >= totalStudents) {
        break;
      }
    }

    // --- 3. Save to Database ---
    const newPlan = await SeatingPlan.create({
      planData: seatingPlan,
      studentCount: studentList.length,
      roomList: roomList,
      planName: `Plan - ${new Date().toLocaleString()}` // Give it a default name
    });

    // --- 4. Return JSON Response ---
    res.status(201).json({ success: true, message: "Plan created!", plan: newPlan });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating seating plan", error: error.message });
  }
};

/**
 * @route   GET /api/seating-plans
 * @desc    Fetches all saved seating plans
 */
exports.getSeatingPlans = async (req, res) => {
  try {
    const plans = await SeatingPlan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
     console.error(error);
     res.status(500).json({ message: "Error fetching plans", error: error.message });
  }
};

/**
 * @route   GET /api/seating-plan-pdf/:planId
 * @desc    Downloads a specific plan as a PDF
 */
exports.downloadSeatingPlanPDF = async (req, res) => {
  try {
    const plan = await SeatingPlan.findById(req.params.planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const { planData, studentCount } = plan;

    // --- PDF Generation Logic ---
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Seating_Plan_${plan._id}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('Seating Arrangement Plan', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(12).text(`Total Students: ${studentCount}`);
    doc.moveDown(2);

    for (const roomName in planData) {
      const studentsInRoom = planData[roomName];
      if (studentsInRoom.length > 0) {
        if (doc.y > 650) { doc.addPage(); } // Check for page break

        doc.fontSize(16).text(`Room: ${roomName}`, { underline: true });
        doc.fontSize(14).text(`Students: (${studentsInRoom.length})`);
        doc.moveDown(1);

        // Correct two-column layout
        const allStudentsText = studentsInRoom.join('\n');
        doc.fontSize(12).text(allStudentsText, {
          columns: 2,
          columnGap: 15,
          height: Math.max(100, (studentsInRoom.length * 15) / 2) // Estimate height
        });
        doc.moveDown(2);
      }
    }
    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating PDF", error: error.message });
  }
};