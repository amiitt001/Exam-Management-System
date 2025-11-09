const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 5000;

const mongoose = require("mongoose");
const Paper = require("./models/Paper");

// ✅ Replace this with your MongoDB Atlas connection string
mongoose.connect("mongodb+srv://Admin:Admin9845@cluster0.lwvjxgj.mongodb.net/exampapers")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB error:", err));

// --- Setup ---
app.use(cors());
app.use(express.json());

// ✅ Gemini AI Initialization
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");


// ✅ Saving Generated Paper in DB + Auto PDF (used ONLY if needed)
app.post('/api/generate-paper', async (req, res) => {
  try {
    const { subject, syllabus, difficulty, count, format } = req.body;

    const prompt = `
      You are an expert exam paper generator. Your task is to create exam questions and their answer keys.

      Subject: ${subject}
      Syllabus/Topics: ${syllabus}
      Difficulty: ${difficulty}
      Question Count: ${count}
      Format: ${format}

      Return valid JSON like:
      {
        "questions": [{"number":"1","text":"..."}],
        "answerKey": [{"number":"1","answer":"..."}]
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const examData = JSON.parse(jsonString);

    // ✅ Save to DB
    await Paper.create({
      subject,
      syllabus,
      difficulty,
      count,
      format,
      questions: examData.questions,
      answerKey: examData.answerKey,
      createdAt: new Date()
    });

    res.json({ success: true, message: "Paper saved successfully", data: examData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating paper", error: error.message });
  }
});



// ✅ ✅ PREVIEW MODE (used by React to show questions before PDF)
app.post('/api/generate-paper-mock', (req, res) => {
  try {
    const { syllabus = 'General topics', difficulty = 'medium', format = 'objective', numQuestions = 10 } = req.body;

    const questions = [];
    for (let i = 1; i <= numQuestions; i++) {
      const isObjective = format === 'objective' || (format === 'mixed' && i % 2 === 0);

      questions.push({
        number: String(i),
        question: `(${difficulty}) ${syllabus} - Sample ${isObjective ? 'MCQ' : 'Descriptive'} question ${i}`,
        ...(isObjective ? { options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'] } : {})
      });
    }

    res.json({
      title: `Generated Paper - ${new Date().toLocaleString()}`,
      instructions: `Answer all questions. Difficulty: ${difficulty}. Format: ${format}.`,
      questions
    });

  } catch (err) {
    res.status(500).json({ message: 'Mock generation failed', error: err.message });
  }
});



// ✅ ✅ NEW: DOWNLOAD PDF AFTER USER EDITS QUESTIONS
app.post("/api/generate-paper-pdf", (req, res) => {
  const { questions } = req.body;

  if (!questions || questions.length === 0) {
    return res.status(400).json({ message: "No questions provided" });
  }

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=ExamPaper.pdf");
  doc.pipe(res);

  doc.fontSize(18).text("Exam Paper", { align: "center" });
  doc.moveDown(2);

  questions.forEach((q) => {
    doc.fontSize(12).text(`${q.number}. ${q.question}`);
    doc.moveDown(0.5);
  });

  doc.end();
});



// ✅ Fetch saved papers (Dashboard / History)
app.get("/api/papers", async (req, res) => {
  const papers = await Paper.find().sort({ createdAt: -1 });
  res.json(papers);
});



// ✅ Seating mock endpoint
app.post('/api/assign-seats-mock', (req, res) => {
  try {
    const { students = [], rooms = [] } = req.body;
    const roomCopies = rooms.map(r => ({ name: r.name, capacity: Number(r.capacity) || 0, assigned: [] }));

    const totalCapacity = roomCopies.reduce((s, r) => s + r.capacity, 0);
    const unassigned = [];

    if (totalCapacity === 0) return res.json({ rooms: roomCopies, unassigned: students });

    let roomIndex = 0;
    for (const stu of students) {
      let placed = false;
      for (let attempt = 0; attempt < roomCopies.length; attempt++) {
        const idx = (roomIndex + attempt) % roomCopies.length;
        if (roomCopies[idx].assigned.length < roomCopies[idx].capacity) {
          roomCopies[idx].assigned.push({ id: stu.id, name: stu.name });
          roomIndex = (idx + 1) % roomCopies.length;
          placed = true;
          break;
        }
      }
      if (!placed) unassigned.push(stu);
    }

    res.json({ rooms: roomCopies, unassigned });

  } catch (err) {
    res.status(500).json({ message: 'Assign seats failed', error: err.message });
  }
});



// ✅ Invigilator assignment mock
app.post('/api/assign-invigilators-mock', (req, res) => {
  try {
    const { invigilators = [], sessions = [] } = req.body;

    const invMap = invigilators.map(inv => ({ invigilator: inv, sessions: [] }));

    for (const session of sessions) {
      let minIdx = 0;
      for (let i = 1; i < invMap.length; i++) {
        if (invMap[i].sessions.length < invMap[minIdx].sessions.length) minIdx = i;
      }
      invMap[minIdx].sessions.push(session);
    }

    res.json(invMap);

  } catch (err) {
    res.status(500).json({ message: 'Assign invigilators failed', error: err.message });
  }
});



// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
