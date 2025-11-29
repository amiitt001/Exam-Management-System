const Excel = require("exceljs");
const axios = require('axios');
const FormData = require('form-data');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

// --- Helper to process the Excel file ---
const processExcelFile = async (req) => {
  if (!req.file) throw new Error("No file uploaded.");

  const wb = new Excel.Workbook();
  await wb.xlsx.load(req.file.buffer);
  const sheet = wb.worksheets[0];
  if (!sheet) throw new Error("No first sheet found.");

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

  if (!colRoll1 || !colRoll2) throw new Error("Input must contain columns for both series.");
  if (!colRoom) throw new Error("Input must contain a Room No. column.");

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

  if (rooms.length === 0) throw new Error("No rooms with numeric Row & Column found.");

  // Return raw data
  return { students: studentPairs, rooms };
};

exports.convertPlanToPDF = async (req, res) => {
  try {
    const data = await processExcelFile(req);
    // Send raw data to Python to handle allocation and PDF generation
    const pythonResponse = await axios.post(`${PYTHON_SERVICE_URL}/generate-pdf-from-raw`, data, {
      responseType: 'stream'
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Seating_Plan.pdf');
    pythonResponse.data.pipe(res);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Error processing file", error: error.message });
  }
};

exports.previewSeatingPlan = async (req, res) => {
  try {
    const data = await processExcelFile(req);
    // Get allocated data from Python for preview
    const pythonResponse = await axios.post(`${PYTHON_SERVICE_URL}/preview-allocation`, data);
    res.json(pythonResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.generatePDFFromData = async (req, res) => {
  try {
    const { rooms, assignedData } = req.body;
    // This endpoint might still use the old logic if the frontend sends the structure
    // Or we can update it to use the new logic if we pass raw data.
    // For now, assuming frontend sends 'rooms' and 'assignedData' (which matches the old output),
    // we can keep using /generate-pdf-from-logic in Python if it exists, or adapt.
    // However, since we want to respect rows/cols, and 'assignedData' might not have that info if it came from the old controller (which it won't anymore),
    // we should be fine.
    // If the frontend sends back what it got from previewSeatingPlan (which now comes from Python),
    // then it should be in the correct format for /generate-pdf-from-logic.

    const pythonResponse = await axios.post(`${PYTHON_SERVICE_URL}/generate-pdf-from-logic`, {
      rooms, assignedData
    }, {
      responseType: 'stream'
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Seating_Plan.pdf');
    pythonResponse.data.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating PDF", error: error.message });
  }
};