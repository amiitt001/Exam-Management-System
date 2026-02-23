import React, { useState } from 'react';
import axios from 'axios';
import { Card, Icon, Btn, Badge } from "../ui/index";

function SeatingPlanner() {
  const [studentFile, setStudentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [pattern, setPattern] = useState('standard');

  const theme = {
    accent: "#3b82f6",
    accentSoft: "rgba(59,130,246,0.12)",
    textSub: "#94a3b8",
    surfaceAlt: "#1a2235",
    textMuted: "#64748b",
  };

  const patterns = [
    { id: 'standard', label: 'Standard Z' },
    { id: 'staggered', label: 'Staggered' },
    { id: 'snake', label: 'Snake S' },
    { id: 'snake-vertical', label: 'Vert. Snake' },
    { id: 'checkerboard', label: 'Checkerboard' },
    { id: 'hybrid', label: 'Hybrid Auto' },
  ];

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) { setStudentFile(files[0]); setError(null); }
  };
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) { setStudentFile(files[0]); setError(null); }
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!studentFile) { setError("Please upload a master seating plan file."); return; }
    setLoading(true); setError(null);

    try {
      const formData = new FormData();
      formData.append('seatingPlanFile', studentFile);
      formData.append('pattern', pattern);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/preview-seating-plan`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const { rooms, unallocated, total_students, assignedData } = response.data;
      setPreviewData({ rooms, assignedData, unallocated, total_students });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to generate preview.");
    }
    finally { setLoading(false); }
  };

  const handleStudentChange = (roomName, pairIndex, field, value) => {
    const newData = { ...previewData };
    const roomData = newData.assignedData[roomName];
    if (roomData && roomData.pairs[pairIndex]) {
      roomData.pairs[pairIndex][field] = value;
      setPreviewData(newData);
    }
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/generate-pdf-from-data`, {
        rooms: previewData.rooms,
        assignedData: previewData.assignedData,
        unallocated: previewData.unallocated || []
      }, { responseType: 'blob' });
      const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `Seating_Plan.pdf`;
      link.click();
    } catch (err) { setError("Failed to generate PDF."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fade-in space-y-8">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Seating Architect</h1>
          <p style={{ color: theme.textSub }}>Engineered seating arrangements with spatial logic</p>
        </div>
        {previewData && (
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn variant="ghost" onClick={() => setPreviewData(null)}>Reset</Btn>
            <Btn onClick={handleDownloadPDF} disabled={loading}>
              {loading ? <span className="spin">⟳</span> : <Icon name="download" size={16} />}
              Architect PDF
            </Btn>
          </div>
        )}
      </div>

      {!previewData ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <Card>
              <h3 style={{ fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="chart" size={18} color={theme.accent} /> Layout Logic
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {patterns.map((p) => (
                  <div key={p.id} onClick={() => setPattern(p.id)} style={{
                    padding: 16, borderRadius: 12, border: `1px solid ${pattern === p.id ? theme.accent : theme.surfaceAlt}`,
                    background: pattern === p.id ? theme.accentSoft : theme.surfaceAlt, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
                  }}>
                    <div style={{ color: pattern === p.id ? theme.accent : theme.textSub, fontWeight: 700, fontSize: 13 }}>{p.label}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 style={{ fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="upload" size={18} color={theme.accent} /> Data Integration
              </h3>
              <label
                className={`relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer 
                    ${isDragging ? 'bg-blue-500/10 border-blue-500' : 'bg-surface-alt border-border-subtle hover:border-blue-500/50'}`}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                style={{ background: theme.surfaceAlt, borderColor: isDragging ? theme.accent : '#1e2d45', minHeight: 180 }}
              >
                <input type="file" accept=".csv, .xls, .xlsx" onChange={handleFileChange} className="hidden" />
                <div style={{ width: 56, height: 56, background: theme.accentSoft, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent, marginBottom: 16 }}>
                  <Icon name={studentFile ? "check" : "upload"} size={28} />
                </div>
                {studentFile ? (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>{studentFile.name}</p>
                    <Badge color="blue">File Selected</Badge>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>Drop seating plan file</p>
                    <p style={{ fontSize: 13, color: theme.textMuted }}>XLSX or CSV supported</p>
                  </div>
                )}
              </label>
              <Btn onClick={handlePreview} disabled={loading || !studentFile} style={{ width: '100%', marginTop: 24, justifyContent: 'center' }}>
                {loading ? <><span className="spin">⟳</span> Initializing...</> : 'Initialize Preview Engine'}
              </Btn>
              {error && <p style={{ marginTop: 16, color: '#ef4444', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{error}</p>}
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card style={{ background: theme.accentSoft, border: `1px solid ${theme.accent}30` }}>
              <Icon name="info" color={theme.accent} size={32} />
              <h4 style={{ fontWeight: 700, fontSize: 18, marginTop: 16, marginBottom: 8 }}>Neural Allocation</h4>
              <p style={{ fontSize: 14, color: theme.textSub, lineHeight: 1.6, marginBottom: 20 }}>
                Our engine automatically handles branch distribution to minimize proximity between students from the same department.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Custom room naming', 'Roll number sorting', 'Capacity tracking', 'Manual overrides'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: theme.accent, fontWeight: 600 }}>
                    <div style={{ width: 6, height: 6, background: theme.accent, borderRadius: '50%' }} />
                    {item}
                  </div>
                ))}
              </div>
            </Card>
            <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 42, height: 42, background: theme.surfaceAlt, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted }}>
                <Icon name="check" size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>System Status</div>
                <div style={{ fontSize: 12, color: theme.textMuted }}>Ready for data core</div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="fade-in space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Rooms', value: previewData.rooms.length },
              { label: 'Capacity', value: previewData.rooms.reduce((acc, r) => acc + (r.rows * r.cols * 2), 0) },
              { label: 'Placed', value: previewData.total_students },
              { label: 'Unallocated', value: previewData.unallocated?.length || 0 },
            ].map((stat, i) => (
              <Card key={i}>
                <p style={{ fontSize: 12, color: theme.textSub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{stat.label}</p>
                <p style={{ fontSize: 24, fontWeight: 800 }}>{stat.value}</p>
              </Card>
            ))}
          </div>

          <div className="space-y-8">
            {previewData.rooms.map((room) => {
              const roomData = previewData.assignedData[room.name];
              if (!roomData) return null;
              const pairs = roomData.pairs;
              const numColumns = window.innerWidth > 1200 ? 4 : window.innerWidth > 768 ? 2 : 1;
              const rowsPerColumn = Math.ceil(pairs.length / numColumns);

              return (
                <Card key={room.name} style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: "20px 24px", borderBottom: `1px solid #1e2d45`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                      <Badge color="blue">{room.name}</Badge>
                      <h3 style={{ fontWeight: 700, fontSize: 18, marginTop: 4 }}>{room.college || "Inst. Examination Cell"}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: theme.textMuted, fontWeight: 700 }}>STUDENTS</div>
                        <div style={{ fontWeight: 700 }}>{pairs.reduce((acc, p) => acc + (p.s1 ? 1 : 0) + (p.s2 ? 1 : 0), 0)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: theme.textMuted, fontWeight: 700 }}>CAPACITY</div>
                        <div style={{ fontWeight: 700 }}>{room.rows * room.cols * 2}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: 24 }}>
                    <div style={{ padding: 8, background: theme.surfaceAlt, borderRadius: 8, textAlign: 'center', fontSize: 11, fontWeight: 800, color: theme.textMuted, letterSpacing: '4px', marginBottom: 20 }}>
                      WHITE BOARD AREA
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                      {[...Array(numColumns)].map((_, colIndex) => {
                        const startIdx = colIndex * rowsPerColumn;
                        const endIdx = Math.min(startIdx + rowsPerColumn, pairs.length);
                        const columnPairs = pairs.slice(startIdx, endIdx);
                        if (columnPairs.length === 0) return null;

                        return (
                          <div key={colIndex}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ borderBottom: `1px solid #1e2d45`, fontSize: 10, color: theme.textMuted, fontWeight: 800 }}>
                                  <th style={{ padding: '0 8px 8px 8px', textAlign: 'left' }}>#</th>
                                  <th style={{ padding: '0 8px 8px 8px', textAlign: 'left' }}>S1</th>
                                  <th style={{ padding: '0 8px 8px 8px', textAlign: 'left' }}>S2</th>
                                </tr>
                              </thead>
                              <tbody>
                                {columnPairs.map((pair, i) => {
                                  const originalIndex = startIdx + i;
                                  return (
                                    <tr key={originalIndex} style={{ borderBottom: `1px solid rgba(30, 45, 69, 0.3)` }}>
                                      <td style={{ padding: '8px', fontSize: 11, color: theme.textMuted, fontWeight: 700 }}>{originalIndex + 1}</td>
                                      <td style={{ padding: '8px' }}>
                                        <input
                                          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 11, fontWeight: 500, width: '100%', outline: 'none' }}
                                          value={pair.s1} onChange={(e) => handleStudentChange(room.name, originalIndex, 's1', e.target.value)}
                                        />
                                      </td>
                                      <td style={{ padding: '8px' }}>
                                        <input
                                          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 11, fontWeight: 500, width: '100%', outline: 'none' }}
                                          value={pair.s2} onChange={(e) => handleStudentChange(room.name, originalIndex, 's2', e.target.value)}
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
                  </div>

                  {roomData.summary && (
                    <div style={{ padding: "16px 24px", background: 'rgba(255,255,255,0.01)', borderTop: `1px solid #1e2d45`, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      {Object.entries(roomData.summary).map(([branch, count]) => (
                        <div key={branch} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: theme.textMuted }}>{branch}</span>
                          <Badge color="green">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default SeatingPlanner;
