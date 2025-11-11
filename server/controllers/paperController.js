const { GoogleGenerativeAI } = require('@google/generative-ai');
const Paper = require('../models/Paper');
const PDFDocument = require('pdfkit');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @route   POST /api/generate-paper
 * @desc    Generates a paper with AI and saves it to the database
 */
exports.generatePaper = async (req, res) => {
  try {
    const { subject, syllabus, difficulty, count, format } = req.body;

    const prompt = `
      You are an expert exam paper generator. Your task is to create exam questions and their answer keys.
      Subject: ${subject}, Syllabus/Topics: ${syllabus}, Difficulty: ${difficulty}, Question Count: ${count}, Format: ${format}
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

    // Save to DB
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

    res.status(201).json({ success: true, message: "Paper saved successfully", data: examData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating paper", error: error.message });
  }
};

/**
 * @route   POST /api/generate-paper-pdf
 * @desc    Takes user-edited JSON questions and returns a PDF
 */
exports.downloadPaperPDF = (req, res) => {
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
    doc.fontSize(12).text(`${q.number}. ${q.question || q.text}`); // Use .question or .text
    doc.moveDown(0.5);
  });

  doc.end();
};

/**
 * @route   GET /api/papers
 * @desc    Fetches all saved exam papers
 */
exports.getPapers = async (req, res) => {
  try {
    const papers = await Paper.find().sort({ createdAt: -1 });
    res.json(papers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching papers", error: error.message });
  }
};

// ... (You can add your mock endpoint logic here as well if needed) ...