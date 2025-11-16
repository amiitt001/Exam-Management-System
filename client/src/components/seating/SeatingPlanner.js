import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/App.css'; 

function SeatingPlanner() { 
  const [studentFile, setStudentFile] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // --- Drag-and-Drop Handlers ---
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setStudentFile(files[0]);
      setError(null);
    }
  };
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setStudentFile(files[0]);
      setError(null);
    }
  };
  
  // --- UPDATED handleSubmit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentFile) {
      setError("Please upload a master seating plan file.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('seatingPlanFile', studentFile);
    formData.append('mimetype', studentFile.type); // Send mimetype

    try {
      // --- Call the new "convert-to-pdf" endpoint ---
      const response = await axios.post(
        'http://localhost:5000/api/convert-to-pdf', // <-- UPDATED
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          responseType: 'blob' // <-- We expect a PDF back
        }
      );
      
      // --- Handle the PDF download directly ---
      const file = new Blob([response.data], { type: 'application/pdf' }); // <-- PDF type
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `Seating_Plan_Output.pdf`); // <-- .pdf
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setStudentFile(null); 
      e.target.reset(); 

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const errText = await err.response.data.text();
        try {
            const errJson = JSON.parse(errText);
            setError(errJson.message || "Failed to convert file.");
        } catch {
             setError(errText || "Failed to convert file.");
        }
      } else {
        setError("Failed to convert file. Check server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exam-form" style={{ maxWidth: '600px', margin: 'auto' }}> 
      <h2>Convert Master Plan to PDF</h2>
      <p style={{ color: '#aaa', marginTop: '-10px' }}>
        Upload your master Excel file to generate the final, per-room PDF.
      </p>
      <form onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label>Master Seating File (Excel or CSV)</label>
          <label 
            htmlFor="fileInput"
            className={`dropzone ${isDragging ? 'dropzone-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv, .xls, .xlsx"
              onChange={handleFileChange}
              required={!studentFile} 
              id="fileInput"
              className="dropzone-input"
            />
            {studentFile ? (
              <p>Selected file: <strong>{studentFile.name}</strong></p>
            ) : (
              <p>Drag & drop your file here, or click to select</p>
            )}
          </label>
        </div>

        <button type="submit" disabled={loading} style={{marginTop: '1rem'}}>
          {loading ? 'Converting...' : 'Convert & Download PDF'} 
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default SeatingPlanner;