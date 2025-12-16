const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit');
const { createPaper, listPapers } = require('../repositories/papers');

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

    // Save via repository (Mongo or Firestore)
    await createPaper({
      subject,
      syllabus,
      difficulty,
      count,
      format,
      questions: examData.questions,
      answerKey: examData.answerKey,
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
exports.downloadPaperPDF = async (req, res) => {
  const { questions } = req.body;

  if (!questions || questions.length === 0) {
    return res.status(400).json({ message: "No questions provided" });
  }

  const bucket = process.env.GCS_BUCKET;
  if (!bucket) {
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=ExamPaper.pdf");
    doc.pipe(res);
    doc.fontSize(18).text("Exam Paper", { align: "center" });
    doc.moveDown(2);
    questions.forEach((q) => {
      doc.fontSize(12).text(`${q.number}. ${q.question || q.text}`);
      doc.moveDown(0.5);
    });
    doc.end();
    return;
  }

  // Buffer and upload to GCS
  const chunks = [];
  const doc = new PDFDocument();
  doc.on('data', (d) => chunks.push(d));
  const finished = new Promise((resolve) => doc.on('end', resolve));
  doc.fontSize(18).text("Exam Paper", { align: "center" });
  doc.moveDown(2);
  questions.forEach((q) => {
    doc.fontSize(12).text(`${q.number}. ${q.question || q.text}`);
    doc.moveDown(0.5);
  });
  doc.end();
  await finished;
  try {
    const buffer = Buffer.concat(chunks);
    const { uploadBuffer } = require('../utils/gcs');
    const ts = Date.now();
    const url = await uploadBuffer({
      bucketName: bucket,
      destination: `papers/ExamPaper_${ts}.pdf`,
      buffer,
      contentType: 'application/pdf'
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=ExamPaper.pdf");
    res.setHeader('X-File-URL', url);
    res.send(buffer);
  } catch (e) {
    console.error('GCS upload failed for paper PDF:', e.message);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=ExamPaper.pdf");
    res.send(Buffer.concat(chunks));
  }
};

/**
 * @route   GET /api/papers
 * @desc    Fetches all saved exam papers
 */
exports.getPapers = async (req, res) => {
  try {
    const papers = await listPapers();
    res.json(papers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching papers", error: error.message });
  }
};

// ... (You can add your mock endpoint logic here as well if needed) ...