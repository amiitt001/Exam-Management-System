const SeatingPlan = require("../models/SeatingPlan");
const shuffleArray = require("../utils/shuffleArray");
const PDFDocument = require("pdfkit");
const csv = require("csv-parser");
const pdf = require("pdf-parse");
const { Readable } = require("stream");

/**
 * --- HELPER: Parse the uploaded file (CSV or PDF) ---
 * We expect a file with "rollNumber" and "branch" columns.
 */
async function parseStudentFile(fileBuffer, mimetype) {
  const students = [];

  if (mimetype === "text/csv") {
    // --- Parse CSV ---
    return new Promise((resolve, reject) => {
      const stream = Readable.from(fileBuffer.toString());
      stream
        .pipe(csv())
        .on("data", (row) => {
          // Find keys for roll number and branch (case-insensitive)
          const rollKey = Object.keys(row).find(k => k.toLowerCase() === 'rollnumber' || k.toLowerCase() === 'roll no');
          const branchKey = Object.keys(row).find(k => k.toLowerCase() === 'branch' || k.toLowerCase() === 'section');
          
          if (rollKey && branchKey) {
            students.push({ roll: row[rollKey].trim(), branch: row[branchKey].trim() });
          }
        })
        .on("end", () => resolve(students))
        .on("error", (error) => reject(error));
    });

  } else if (mimetype === "application/pdf") {
    // --- Parse PDF ---
    // NOTE: This is unreliable and expects a text-based PDF, not a scanned image.
    // It expects text like: R001, CSE-V \n R002, ECE-III
    const data = await pdf(fileBuffer);
    const lines = data.text.split('\n');
    lines.forEach(line => {
      const parts = line.split(','); // Simple CSV-like parsing
      if (parts.length === 2) {
        students.push({ roll: parts[0].trim(), branch: parts[1].trim() });
      }
    });
    return students;

  } else {
    throw new Error("Unsupported file type. Please upload a CSV or text-based PDF.");
  }
}

/**
 * --- HELPER: The new "Branch-Mixed" Seating Algorithm ---
 * This tries to replicate your example PDF.
 */
function createMixedPlan(students, roomList) {
  // 1. Group students by branch
  const groups = {};
  students.forEach(s => {
    if (!groups[s.branch]) {
      groups[s.branch] = [];
    }
    groups[s.branch].push(s);
  });

  // 2. Shuffle each group individually
  for (const branch in groups) {
    shuffleArray(groups[branch]);
  }

  // 3. Sort branches by size (largest first)
  const sortedBranches = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);

  // 4. Create two "mega-series" to interleave
  const rollSeries1 = [];
  const rollSeries2 = [];
  
  // Put the largest group in Series 1
  rollSeries1.push(...groups[sortedBranches[0]]);
  
  // Put all other groups in Series 2
  for (let i = 1; i < sortedBranches.length; i++) {
    rollSeries2.push(...groups[sortedBranches[i]]);
  }

  // 5. Shuffle Series 2 to mix the smaller branches
  shuffleArray(rollSeries2);

  // 6. Assign students to rooms
  const finalPlan = {};
  let s1_idx = 0; // Index for Series 1
  let s2_idx = 0; // Index for Series 2

  for (const room of roomList) {
    const roomName = room.name;
    const capacity = parseInt(room.capacity, 10);
    
    const roomData = {
      series1: [],
      series2: [],
      summary: {}
    };

    for (let i = 0; i < capacity; i++) {
      // Pick one student for the seat
      let student;
      
      // Alternate between Series 1 and Series 2 to fill the room
      // This ensures a 50/50 mix if possible
      if (i % 2 === 0) {
        if (s1_idx < rollSeries1.length) {
          student = rollSeries1[s1_idx++];
          roomData.series1.push(student);
        } else if (s2_idx < rollSeries2.length) {
          student = rollSeries2[s2_idx++];
          roomData.series2.push(student);
        }
      } else {
         if (s2_idx < rollSeries2.length) {
          student = rollSeries2[s2_idx++];
          roomData.series2.push(student);
        } else if (s1_idx < rollSeries1.length) {
          student = rollSeries1[s1_idx++];
          roomData.series1.push(student);
        }
      }

      if (!student) break; // Stop if no students are left

      // Update room summary
      if (!roomData.summary[student.branch]) {
        roomData.summary[student.branch] = 0;
      }
      roomData.summary[student.branch]++;
    }
    finalPlan[roomName] = roomData;
  }
  
  // TODO: Check for unassigned students (s1_idx < rollSeries1.length or s2_idx < rollSeries2.length)
  return finalPlan;
}


// --- UPDATED: generateSeatingPlan ---
exports.generateSeatingPlan = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No student file uploaded." });
    }

    // 1. Parse the uploaded file
    const students = await parseStudentFile(req.file.buffer, req.file.mimetype);
    if (students.length === 0) {
      return res.status(400).json({ message: "Could not parse any students from the file. Check format." });
    }

    // 2. Parse the roomList (which is now a JSON string)
    const roomList = JSON.parse(req.body.roomList);

    // 3. Run the new algorithm
    const planData = createMixedPlan(students, roomList);

    // 4. Save to Database
    const newPlan = await SeatingPlan.create({
      planData: planData,
      studentCount: students.length,
      roomList: roomList,
      planName: `Plan - ${new Date().toLocaleString()}`
    });

    res.status(201).json({ success: true, message: "Plan created!", plan: newPlan });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating seating plan", error: error.message });
  }
};


// --- UPDATED: downloadSeatingPlanPDF ---
// This now generates the complex PDF layout
exports.downloadSeatingPlanPDF = async (req, res) => {
  try {
    const plan = await SeatingPlan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Seating_Plan_${plan._id}.pdf`);
    doc.pipe(res);

    // Loop through each room in the plan
    for (const roomName in plan.planData) {
      const room = plan.planData[roomName];
      const { series1, series2, summary } = room;
      const totalInRoom = series1.length + series2.length;
      if (totalInRoom === 0) continue; // Skip empty rooms

      doc.addPage();
      
      // --- PDF Header ---
      doc.fontSize(14).text('GALGOTIAS COLLEGE OF ENGINEERING & TECHNOLOGY, GREATER NOIDA', { align: 'center' });
      doc.fontSize(12).text('CONTINUOUS ASSESSMENT EXAM-I, OСT- 2025', { align: 'center' });
      doc.moveDown(2);

      // --- Room Header ---
      doc.fontSize(18).font('Helvetica-Bold').text(roomName, { align: 'left' });
      doc.fontSize(14).font('Helvetica-Bold').text(`Total Students: ${totalInRoom}`, { align: 'right' });
      doc.moveDown(1);
      
      // --- Table Headers ---
      const tableTop = doc.y;
      const col1_x = 40;
      const col2_x = 100;
      const col3_x = 320;
      
      doc.font('Helvetica-Bold');
      doc.text("Seat No.", col1_x, tableTop);
      doc.text("Roll Series 1 (Branch)", col2_x, tableTop);
      doc.text("Roll Series 2 (Branch)", col3_x, tableTop);
      doc.moveDown(0.5);
      doc.strokeColor("#000").lineWidth(1).moveTo(col1_x, doc.y).lineTo(570, doc.y).stroke();
      doc.moveDown(0.5);

      // --- Table Content ---
      doc.font('Helvetica');
      let y = doc.y;
      const rowHeight = 28; // Height for two lines (roll + branch)
      
      // We base the seat count on the LONGER of the two series
      const seatCount = Math.max(series1.length, series2.length);

      for (let i = 0; i < seatCount; i++) {
        if (y > 720) { // Manual page break
          doc.addPage();
          y = 40;
        }

        // Seat Number
        doc.text(i + 1, col1_x, y);

        // Roll Series 1
        if (series1[i]) {
          doc.text(series1[i].roll, col2_x, y);
          doc.fontSize(10).fillColor("gray").text(series1[i].branch, col2_x, y + 13);
        }

        // Roll Series 2
        if (series2[i]) {
          doc.fontSize(12).fillColor("black").text(series2[i].roll, col3_x, y);
          doc.fontSize(10).fillColor("gray").text(series2[i].branch, col3_x, y + 13);
        }
        
        doc.fontSize(12).fillColor("black"); // Reset styles
        y += rowHeight;
      }
      
      doc.y = y; // Move doc cursor to end of table
      
      // --- Summary Footer ---
      doc.moveDown(2);
      doc.font('Helvetica-Bold').text('Branch & Students:', col1_x, doc.y);
      let summaryText = [];
      for(const branch in summary) {
        summaryText.push(`${branch} = ${summary[branch]}`);
      }
      doc.font('Helvetica').text(summaryText.join('  |  '));
    }

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating PDF", error: error.message });
  }
};

// --- getSeatingPlans (No change needed) ---
exports.getSeatingPlans = async (req, res) => {
  // ... (this logic is still correct)
};