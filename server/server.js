const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 5000;

// --- Setup ---
app.use(cors());
app.use(express.json());

// Initialize Google AI
// IMPORTANT: Get your API key from Google AI Studio
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

// --- Helper function to shuffle an array ---
// This is the Fisher-Yates algorithm, a great way to randomize
function shuffleArray(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

// --- The Main API Endpoint ---
app.post('/api/generate-paper', async (req, res) => {
    try {
        // 1. Get inputs from the React frontend
        const { subject, syllabus, difficulty, count, format } = req.body;

        // 2. Generate the AI prompt (THE MOST IMPORTANT PART)
        const prompt = `
            You are an expert exam paper generator. Your task is to create a set of questions and a corresponding answer key based on the user's requirements.

            Subject: ${subject}
            Syllabus/Topics: ${syllabus}
            Difficulty: ${difficulty}
            Question Count: ${count}
            Format: ${format}

            Instructions:
            1. Generate the exact number of questions requested.
            2. Adhere strictly to the difficulty and topics.
            3. Return your response as a single, valid JSON object.
            4. The JSON object must have two keys: "questions" and "answerKey".
            5. "questions" must be an array of objects, each with "number" (string) and "text" (string).
            6. "answerKey" must be an array of objects, each with "number" (string) and "answer" (string).

            Example JSON format:
            {
              "questions": [
                { "number": "1", "text": "What is the capital of France?" },
                { "number": "2", "text": "Define 'photosynthesis'." }
              ],
              "answerKey": [
                { "number": "1", "answer": "Paris" },
                { "number": "2", "answer": "The process by which green plants use sunlight..." }
              ]
            }
        `;

        // 3. Call the Gemini AI
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();

        // 4. Parse the AI's JSON response
        // We clean up the response to ensure it's valid JSON
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const examData = JSON.parse(jsonString);

        // 5. Generate the PDF
        const doc = new PDFDocument({ margin: 50 });

        // Set headers to send a PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=ExamPaper.pdf');

        // Pipe the PDF directly to the response
        doc.pipe(res);

        // --- Add content to the PDF ---
        // Header
        doc.fontSize(20).text(`Exam: ${subject}`, { align: 'center' });
        doc.fontSize(14).text(`Difficulty: ${difficulty}`, { align: 'center' });
        doc.moveDown(2);

        // Questions
        doc.fontSize(16).text('Questions', { underline: true });
        doc.moveDown(1);
        examData.questions.forEach(q => {
            doc.fontSize(12).text(`${q.number}. ${q.text}`);
            doc.moveDown(0.5);
        });

        // Answer Key (on a new page)
        doc.addPage();
        doc.fontSize(16).text('Answer Key', { underline: true });
        doc.moveDown(1);
        examData.answerKey.forEach(a => {
            doc.fontSize(12).text(`${a.number}. ${a.answer}`);
            doc.moveDown(0.5);
        });
        // --- End PDF content ---

        // Finalize the PDF
        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generating exam paper", error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Lightweight mock endpoint for front-end development and testing.
// Accepts: { syllabus, difficulty, format, numQuestions }
app.post('/api/generate-paper-mock', (req, res) => {
  try {
    const { syllabus = 'General topics', difficulty = 'medium', format = 'objective', numQuestions = 10 } = req.body;

    const questions = [];
    for (let i = 1; i <= Math.max(1, Number(numQuestions)); i++) {
      if (format === 'objective') {
        questions.push({
          number: String(i),
          question: `(${difficulty}) ${syllabus} - Sample MCQ question ${i}`,
          options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4']
        });
      } else if (format === 'subjective') {
        questions.push({
          number: String(i),
          question: `(${difficulty}) ${syllabus} - Sample descriptive question ${i}`
        });
      } else {
        // mixed
        const isObj = i % 2 === 0;
        questions.push({
          number: String(i),
          question: `(${difficulty}) ${syllabus} - Sample ${isObj ? 'MCQ' : 'Descriptive'} question ${i}`,
          ...(isObj ? { options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'] } : {})
        });
      }
    }

    const paper = {
      title: `Generated Paper - ${new Date().toLocaleString()}`,
      instructions: `Answer all questions. Difficulty: ${difficulty}. Format: ${format}.`,
      questions
    };

    res.json(paper);
  } catch (err) {
    console.error('Mock generate error', err);
    res.status(500).json({ message: 'Mock generation failed', error: err.message });
  }
});

// Seating assignment mock endpoint
// Accepts: { students: [{id,name}], rooms: [{name,capacity}] }
// Returns: { rooms: [{name,capacity,assigned:[{id,name}]}], unassigned: [] }
app.post('/api/assign-seats-mock', (req, res) => {
  try {
    const { students = [], rooms = [] } = req.body;

    // Defensive copies
    const roomCopies = rooms.map(r => ({ name: r.name, capacity: Number(r.capacity) || 0, assigned: [] }));

    // Simple balanced fill algorithm:
    // - Sort rooms by capacity descending to fill larger rooms first
    // - For each student, assign to the room with current lowest load that still has capacity
    const totalCapacity = roomCopies.reduce((s, r) => s + r.capacity, 0);
    const unassigned = [];

    if (students.length === 0) return res.json({ rooms: roomCopies, unassigned: [] });

    // If no capacity at all, everything is unassigned
    if (totalCapacity === 0) return res.json({ rooms: roomCopies, unassigned: students });

    // Maintain an index position to try to distribute evenly
    let roomIndex = 0;
    for (const stu of students) {
      // attempt to find a room with available capacity, trying round-robin starting at roomIndex
      let placed = false;
      for (let attempt = 0; attempt < roomCopies.length; attempt++) {
        const idx = (roomIndex + attempt) % roomCopies.length;
        const room = roomCopies[idx];
        if (room.assigned.length < room.capacity) {
          room.assigned.push({ id: stu.id, name: stu.name });
          roomIndex = (idx + 1) % roomCopies.length; // next time start from next room
          placed = true;
          break;
        }
      }
      if (!placed) unassigned.push(stu);
    }

    res.json({ rooms: roomCopies, unassigned });
  } catch (err) {
    console.error('Assign seats error', err);
    res.status(500).json({ message: 'Assign seats failed', error: err.message });
  }
});

// Invigilator assignment mock endpoint
// Accepts: { invigilators: [{id,name}], sessions: [{id,exam,room,time}] }
// Returns: array of { invigilator, sessions: [...] }
app.post('/api/assign-invigilators-mock', (req, res) => {
  try {
    const { invigilators = [], sessions = [] } = req.body;
    if (!Array.isArray(invigilators) || !Array.isArray(sessions)) {
      return res.status(400).json({ message: 'invigilators and sessions must be arrays' });
    }

    // Initialize assignment counts
    const invMap = invigilators.map(inv => ({ invigilator: { id: inv.id, name: inv.name }, sessions: [] }));

    // Simple load-balancing: assign each session to invigilator with least sessions so far
    for (const session of sessions) {
      // find index of invigilator with min sessions
      let minIdx = 0;
      let minCount = invMap[0]?.sessions.length ?? Infinity;
      for (let i = 1; i < invMap.length; i++) {
        if (invMap[i].sessions.length < minCount) {
          minCount = invMap[i].sessions.length;
          minIdx = i;
        }
      }
      // assign session
      invMap[minIdx].sessions.push(session);
    }

    res.json(invMap);
  } catch (err) {
    console.error('Assign invigilators error', err);
    res.status(500).json({ message: 'Assign invigilators failed', error: err.message });
  }
});