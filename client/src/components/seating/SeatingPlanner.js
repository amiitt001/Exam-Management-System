import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/App.css';

function SeatingPlanner() {
  const [studentFile, setStudentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState(null); // { rooms: [], assignedData: {} }
  const [pattern, setPattern] = useState('standard');

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

  // --- 1. Fetch Preview ---
  const handlePreview = async (e) => {
    e.preventDefault();
    if (!studentFile) {
      setError("Please upload a master seating plan file.");
      return;
    }
    setLoading(true);
    setError(null);
    setPreviewData(null);

    try {
      const formData = new FormData();
      formData.append('file', studentFile);

      // 1. Upload File
      const uploadRes = await axios.post(process.env.REACT_APP_API_URL + '/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { data_id } = uploadRes.data;

      // 2. Calculate Seating
      const previewRes = await axios.post(process.env.REACT_APP_API_URL + '/calculate', {
        data_id,
        pattern
      });

      setPreviewData(previewRes.data);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to generate preview.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Handle Edits ---
  const handleStudentChange = (roomName, pairIndex, field, value) => {
    const newData = { ...previewData };
    const roomData = newData.assignedData[roomName];
    if (roomData && roomData.pairs[pairIndex]) {
      roomData.pairs[pairIndex][field] = value;
      setPreviewData(newData);
    }
  };

  // --- 3. Generate PDF from (Edited) Data ---
  const handleDownloadPDF = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL + '/api/generate-pdf-from-data',
        previewData,
        {
          responseType: 'blob',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `Seating_Plan_Output.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

    } catch (err) {
      console.error(err);
      setError("Failed to generate PDF from data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exam-form">
      <h2 style={{ textAlign: 'center', fontSize: '2rem', color: 'var(--primary)' }}>Seating Plan Generator</h2>

      {!previewData ? (
        <>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Upload your master Excel file to preview and edit the seating plan.
          </p>
          <form onSubmit={handlePreview}>
            <div className="form-group">
              <label>Select Seating Pattern</label>
              <div className="pattern-grid">
                {[
                  { id: 'standard', label: 'Standard (Z)', class: 'preview-standard' },
                  { id: 'staggered', label: 'Staggered', class: 'preview-staggered' },
                  { id: 'snake', label: 'Snake (S)', class: 'preview-snake' },
                  { id: 'snake-vertical', label: 'Vert. Snake', class: 'preview-columnar' },
                  { id: 'columnar', label: 'Columnar', class: 'preview-columnar' },
                  { id: 'checkerboard', label: 'Checkerboard', class: 'preview-staggered' },
                  { id: 'single', label: 'Single Seat', class: 'preview-standard' },
                  { id: 'alternate-rows', label: 'Alt. Rows', class: 'preview-standard' },
                  { id: 'hybrid', label: 'Hybrid', class: 'preview-standard' },
                ].map((p) => (
                  <div
                    key={p.id}
                    className={`pattern-card ${pattern === p.id ? 'selected' : ''}`}
                    onClick={() => setPattern(p.id)}
                  >
                    <div className={`pattern-preview ${p.class}`}>
                      <div></div><div></div><div></div><div></div>
                    </div>
                    <span className="pattern-label">{p.label}</span>
                  </div>
                ))}
              </div>

              {/* Hidden select to ensure state is bound if needed, but visual grid handles it */}
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                style={{ display: 'none' }}
              >
                <option value="standard">Standard (Z-Order)</option>
                <option value="staggered">Staggered Classroom Style (Anti-Cheating)</option>
                <option value="snake">Snake (S-Order)</option>
                <option value="snake-vertical">Vertical Snake</option>
                <option value="columnar">Columnar</option>
                <option value="checkerboard">Checkerboard</option>
                <option value="single">Single Seat</option>
                <option value="alternate-rows">Alternate Rows</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

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
                  <div>
                    <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</p>
                    <p>Selected file: <strong>{studentFile.name}</strong></p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Click to change</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>☁️</p>
                    <p>Drag & drop your file here</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>or click to browse</p>
                  </div>
                )}
              </label>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? 'Generating Preview...' : 'Preview Seating Plan'}
            </button>
            {error && <p className="error">{error}</p>}
          </form>
        </>
      ) : (
        <div className="preview-container">
          <div className="sticky-header">
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Preview & Edit</h3>
            <div>
              <button className="cancel-btn" onClick={() => setPreviewData(null)} style={{ marginRight: '10px' }}>
                Cancel
              </button>
              <button className="success-btn" onClick={handleDownloadPDF} disabled={loading}>
                {loading ? 'Generating PDF...' : 'Download Final PDF'}
              </button>
            </div>
          </div>

          {previewData.rooms.map((room) => {
            const roomData = previewData.assignedData[room.name];
            if (!roomData) return null;

            // Calculate columns for 4-column layout
            const pairs = roomData.pairs;
            const numColumns = 4;
            const rowsPerColumn = Math.ceil(pairs.length / numColumns);

            // Calculate stats
            const totalCapacity = room.rows * room.cols * 2;
            const occupied = pairs.reduce((acc, p) => acc + (p.s1 ? 1 : 0) + (p.s2 ? 1 : 0), 0);
            const vacant = totalCapacity - occupied;

            return (
              <div key={room.name} className="room-card">
                {/* Header */}
                <div className="room-header">
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {room.college || "GALGOTIAS EDUCATIONAL INSTITUTIONS, GREATER NOIDA"}
                  </h2>
                  <h3 style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    {room.exam || "1st CAE (ODD-2025-26)"}
                  </h3>
                  <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>
                    Seating Plan
                  </h4>
                </div>

                {/* Room Info */}
                <div className="room-stats">
                  <span>Room: <strong>{room.name}</strong></span>
                  <span>Students: <strong>{occupied}</strong></span>
                  <span style={{ color: 'var(--text-muted)' }}>Capacity: {totalCapacity}</span>
                  <span style={{ color: 'var(--secondary)' }}>Vacant: {vacant}</span>
                </div>

                {/* White Board */}
                <div className="whiteboard">
                  WHITE BOARD
                </div>

                {/* Multi-Column Grid */}
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[...Array(numColumns)].map((_, colIndex) => {
                    const startIdx = colIndex * rowsPerColumn;
                    const endIdx = Math.min(startIdx + rowsPerColumn, pairs.length);
                    const columnPairs = pairs.slice(startIdx, endIdx);

                    if (columnPairs.length === 0) return null;

                    return (
                      <div key={colIndex} style={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <table>
                          <thead>
                            <tr>
                              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                              <th>Series 1</th>
                              <th>Series 2</th>
                            </tr>
                          </thead>
                          <tbody>
                            {columnPairs.map((pair, i) => {
                              const originalIndex = startIdx + i;
                              return (
                                <tr key={originalIndex}>
                                  <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: '500' }}>
                                    {originalIndex + 1}
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className="table-input"
                                      value={pair.s1}
                                      onChange={(e) => handleStudentChange(room.name, originalIndex, 's1', e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className="table-input"
                                      value={pair.s2}
                                      onChange={(e) => handleStudentChange(room.name, originalIndex, 's2', e.target.value)}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Summary */}
                {roomData.summary && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Branch Distribution: </strong>
                    {Object.entries(roomData.summary).map(([branch, count]) => `${branch}: ${count}`).join('  |  ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SeatingPlanner;