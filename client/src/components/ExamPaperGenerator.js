import React, { useState } from "react";
import { FiFileText } from "react-icons/fi";

const ExamPaperGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState(null);

  const generatePaper = async () => {
    setLoading(true);

    const syllabus = document.getElementById("syllabus").value;
    const difficulty = document.getElementById("difficulty").value;
    const format = document.getElementById("format").value;
    const count = document.getElementById("count").value;

    const response = await fetch("http://localhost:5000/api/generate-paper", {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ syllabus, difficulty, format, numQuestions: count })
    });

    const data = await response.json();
    setPaper(data);
    setLoading(false);
  };

  // ✅ Download PDF after saving edits
  const downloadPDF = async () => {
    const response = await fetch("http://localhost:5000/api/generate-paper-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: paper.questions })
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ExamPaper.pdf";
    link.click();
  };

  return (
    <div className="p-3 sm:p-6 text-white">
      <h2 className="text-2xl font-semibold flex items-center gap-2 mb-3">
        <FiFileText className="text-blue-400" />
        Exam Paper Generator
      </h2>

      <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
        
        {/* INPUT FORM */}
        <label>Syllabus / Topics</label>
        <textarea
          id="syllabus"
          className="w-full bg-slate-900 p-3 rounded-md border border-slate-700 mt-2"
          placeholder="E.g. Calculus: limits, derivatives, integrals"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          
          <div>
            <label>Difficulty</label>
            <select id="difficulty" className="w-full bg-slate-900 p-3 rounded-md border border-slate-700 mt-2">
              <option>Easy</option>
              <option selected>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div>
            <label>Format</label>
            <select id="format" className="w-full bg-slate-900 p-3 rounded-md border border-slate-700 mt-2">
              <option>Objective</option>
              <option>Subjective</option>
              <option>Mixed</option>
            </select>
          </div>

          <div>
            <label>Number of questions</label>
            <input
              id="count"
              type="number"
              defaultValue="10"
              className="w-full bg-slate-900 p-3 rounded-md border border-slate-700 mt-2"
            />
          </div>

        </div>

        <button
          onClick={generatePaper}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg font-semibold"
        >
          {loading ? "Generating..." : "Generate Paper"}
        </button>

        {/* ✅ PREVIEW + EDIT MODE */}
        {paper && (
          <div className="mt-10 bg-slate-900 p-5 rounded-lg border border-slate-700">
            <h3 className="text-xl font-semibold mb-4">Preview & Edit Questions</h3>

            {paper.questions.map((q, i) => (
              <div key={i} className="mb-3">
                <label className="text-gray-300 text-sm">Question {q.number}</label>
                <textarea
                  className="w-full bg-slate-800 text-gray-200 p-2 rounded-md border border-slate-700 mt-1"
                  value={q.question}
                  onChange={(e) => {
                    const updated = [...paper.questions];
                    updated[i].question = e.target.value;
                    setPaper({ ...paper, questions: updated });
                  }}
                />
              </div>
            ))}

            <button
              onClick={() => setPaper({ ...paper, saved: true })}
              className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
            >
              ✅ Save Changes
            </button>

            {paper.saved && (
              <button
                onClick={downloadPDF}
                className="mt-4 ml-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
              >
                📄 Download PDF
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamPaperGenerator;
