const Excel = require("exceljs");
const axios = require('axios'); // <-- Required
const FormData = require('form-data'); // <-- Required

const PYTHON_SERVICE_URL = 'http://localhost:8081'; // URL for Python service

/**
 * @route   POST /api/convert-to-pdf
 * @desc    Reads master Excel, runs fill logic, sends to Python for PDF
 */
exports.convertPlanToPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // 1. Read the uploaded file buffer
    const wb = new Excel.Workbook();
    const buffer = req.file.buffer;
    await wb.xlsx.load(buffer);

    const sheet = wb.worksheets[0];
    if (!sheet) {
      return res.status(400).json({ message: "No first sheet found in workbook." });
    }

    // --- YOUR EXACT LOGIC FROM seating.js ---
    const headerMap = {};
    sheet.getRow(1).eachCell((cell, col) => {
      const key = (cell.value || "").toString().trim().toLowerCase();
      if (key) headerMap[key] = col;
    });

    const colRoll1 = headerMap["roll no. series-1"] || headerMap["roll no series-1"];
    const colRoll2 = headerMap["roll no. series-2"] || headerMap["roll no series-2"];
    const colRoom = headerMap["room no."] || headerMap["room no"] || headerMap["room"];
    const colRow = headerMap["row"] || headerMap["rows"];
    const colCol = headerMap["column"] || headerMap["columns"] || headerMap["cols"];
    const colCollege = headerMap["college name"] || headerMap["college"];
    const colExam = headerMap["exam name"] || headerMap["exam"];

    if (!colRoll1 || !colRoll2) return res.status(400).json({ message: "Input must contain columns for both series." });
    if (!colRoom) return res.status(400).json({ message: "Input must contain a Room No. column." });
    
    const studentPairs = [];
    sheet.eachRow((row, rnum) => {
      if (rnum === 1) return;
      const v1 = (row.getCell(colRoll1).value || "").toString().trim();
      const v2 = (row.getCell(colRoll2).value || "").toString().trim();
      if (v1 || v2) studentPairs.push({ s1: v1, s2: v2 });
    });

    const rooms = [];
    const seenRooms = new Set();
    sheet.eachRow((row, rnum) => {
      if (rnum === 1) return;
      const roomVal = (colRoom ? (row.getCell(colRoom).value || "").toString().trim() : "");
      const rCountRaw = colRow ? row.getCell(colRow).value : null;
      const cCountRaw = colCol ? row.getCell(colCol).value : null;
      const rCount = (typeof rCountRaw === "number" && !Number.isNaN(rCountRaw)) ? Math.floor(rCountRaw) : null;
      const cCount = (typeof cCountRaw === "number" && !Number.isNaN(cCountRaw)) ? Math.floor(cCountRaw) : null;
      if (roomVal && rCount && cCount && !seenRooms.has(roomVal)) {
        seenRooms.add(roomVal);
        rooms.push({
          name: roomVal, rows: rCount, cols: cCount,
          college: colCollege ? (row.getCell(colCollege).value || "").toString() : "Galgotias College",
          exam: colExam ? (row.getCell(colExam).value || "").toString() : "Exam"
        });
      }
    });

    if (rooms.length === 0) return res.status(400).json({ message: "No rooms with numeric Row & Column found." });

    let pairIndex = 0;
    const assigned = {}; // This will hold the data for Python
    const splitRollBranch = (str) => {
      if (!str) return { roll: "", branch: "" };
      const s = String(str).trim();
      const parts = s.split(/\s+/);
      const roll = parts[0] || "";
      const branch = parts.slice(1).join(" ") || "";
      return { roll, branch };
    };

    for (const room of rooms) {
      const capacityPairs = room.rows * room.cols;
      assigned[room.name] = {
        pairs: [],
        summary: new Map()
      };
      for (let i = 0; i < capacityPairs && pairIndex < studentPairs.length; i++) {
        const pair = studentPairs[pairIndex++];
        assigned[room.name].pairs.push(pair);
        
        // Calculate summary
        const { branch: b1 } = splitRollBranch(pair.s1);
        const { branch: b2 } = splitRollBranch(pair.s2);
        if (b1) assigned[room.name].summary.set(b1, (assigned[room.name].summary.get(b1) || 0) + 1);
        if (b2) assigned[room.name].summary.set(b2, (assigned[room.name].summary.get(b2) || 0) + 1);
      }
    }
    // --- END OF YOUR LOGIC ---


    // --- 4. NEW: Send this data to Python ---
    
    // Convert Map to plain object for JSON
    const assignedForJSON = {};
    for (const roomName in assigned) {
      assignedForJSON[roomName] = {
        pairs: assigned[roomName].pairs,
        summary: Object.fromEntries(assigned[roomName].summary) // Convert Map to object
      };
    }

    const pythonResponse = await axios.post(`${PYTHON_SERVICE_URL}/generate-pdf-from-logic`, {
      rooms: rooms,
      assignedData: assignedForJSON
    }, {
      responseType: 'stream'
    });

    // --- 5. Stream the final PDF back to the user ---
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Seating_Plan.pdf');
    pythonResponse.data.pipe(res);

  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Error processing file", error: error.message });
  }
};