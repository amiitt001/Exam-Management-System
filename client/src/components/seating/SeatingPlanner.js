import React, { useState } from 'react';
import axios from 'axios';
import { FiCheckSquare, FiUploadCloud, FiFile, FiDownload, FiX, FiInfo, FiLayout } from 'react-icons/fi';

function SeatingPlanner() {
  const [studentFile, setStudentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [pattern, setPattern] = useState('standard');

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

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!studentFile) {
      setError("Please upload a master seating plan file.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', studentFile);

      const uploadRes = await axios.post(
        process.env.REACT_APP_API_URL + '/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const { data_id } = uploadRes.data;

      const calcRes = await axios.post(
        process.env.REACT_APP_API_URL + '/calculate',
        { data_id, pattern }
      );

      const { rooms, unallocated, total_students } = calcRes.data;

      const buildAssignedData = (processedRooms) => {
        const assigned = {};
        processedRooms.forEach((room) => {
          const pairs = [];
          const summary = {};
          for (let r = 0; r < room.rows; r++) {
            for (let c = 0; c < room.cols; c++) {
              const desk = room.grid?.[r]?.[c];
              if (!desk) continue;
              const s1 = desk.left ? `${desk.left.roll || ''} ${desk.left.branch || ''}`.trim() : '';
              const s2 = desk.right ? `${desk.right.roll || ''} ${desk.right.branch || ''}`.trim() : '';
              if (s1 || s2) {
                pairs.push({ s1, s2 });
                const b1 = desk.left?.branch || '';
                const b2 = desk.right?.branch || '';
                if (b1) summary[b1] = (summary[b1] || 0) + 1;
                if (b2) summary[b2] = (summary[b2] || 0) + 1;
              }
            }
          }
          assigned[room.name] = { pairs, summary };
        });
        return assigned;
      };

      setPreviewData({ rooms, assignedData: buildAssignedData(rooms), unallocated, total_students });

    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate preview.");
    } finally {
      setLoading(false);
    }
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
      const response = await axios.post(
        process.env.REACT_APP_API_URL + '/generate-pdf-from-logic',
        {
          rooms: previewData.rooms,
          assignedData: previewData.assignedData,
          unallocated: previewData.unallocated || []
        },
        { responseType: 'blob' }
      );

      const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `Seating_Plan_Architect.pdf`;
      link.click();
    } catch (err) {
      setError("Failed to generate PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">

      {/* Header */}
      <div>
        <span className="text-teal-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-2 block">Spatial Reasoning</span>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
            <FiCheckSquare className="text-teal-400" />
            Seating Architect
          </h2>
          {previewData && (
            <div className="flex gap-4">
              <button
                onClick={() => setPreviewData(null)}
                className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl border border-white/5 transition-all text-sm font-bold flex items-center gap-2"
              >
                <FiX /> Reset
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={loading}
                className="bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-950 px-8 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(0,229,195,0.3)] hover:shadow-[0_0_40px_rgba(0,229,195,0.5)] transition-all flex items-center gap-2"
              >
                {loading ? 'Processing...' : <><FiDownload /> Architect PDF</>}
              </button>
            </div>
          )}
        </div>
      </div>

      {!previewData ? (
        <div className="grid lg:grid-cols-5 gap-10">

          <div className="lg:col-span-3 space-y-8">
            <div className="bg-card backdrop-blur-xl border border-white/5 rounded-[40px] p-10 shadow-2xl">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                <FiLayout className="text-teal-400" />
                Layout Logic
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { id: 'standard', label: 'Standard Z' },
                  { id: 'staggered', label: 'Staggered' },
                  { id: 'snake', label: 'Snake S' },
                  { id: 'snake-vertical', label: 'Vert. Snake' },
                  { id: 'checkerboard', label: 'Checkerboard' },
                  { id: 'hybrid', label: 'Hybrid Auto' },
                ].map((p) => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-center group
                                   ${pattern === p.id
                        ? 'bg-teal-500/10 border-teal-500/50 shadow-[0_0_15px_rgba(0,229,195,0.1)]'
                        : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                    onClick={() => setPattern(p.id)}
                  >
                    <div className={`w-8 h-8 rounded-lg mx-auto mb-3 border border-white/10 group-hover:scale-110 transition-transform flex items-center justify-center
                                       ${pattern === p.id ? 'bg-teal-400 text-slate-900' : 'bg-white/5 text-slate-500'}`}>
                      {p.label[0]}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${pattern === p.id ? 'text-teal-400' : 'text-slate-500'}`}>
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card backdrop-blur-xl border border-white/5 rounded-[40px] p-10 shadow-2xl">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                <FiUploadCloud className="text-teal-400" />
                Data Integration
              </h3>
              <label
                htmlFor="fileInput"
                className={`relative border-2 border-dashed rounded-[32px] p-16 flex flex-col items-center justify-center transition-all cursor-pointer group
                               ${isDragging ? 'bg-teal-500/10 border-teal-400' : 'bg-white/5 border-white/10 hover:border-teal-500/30'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input type="file" accept=".csv, .xls, .xlsx" onChange={handleFileChange} id="fileInput" className="hidden" />
                <div className="w-20 h-20 bg-teal-500/10 rounded-3xl flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                  {studentFile ? <FiFile size={40} /> : <FiUploadCloud size={40} />}
                </div>
                {studentFile ? (
                  <div className="text-center">
                    <p className="text-white font-bold mb-1">{studentFile.name}</p>
                    <p className="text-teal-400/60 text-[10px] font-black uppercase tracking-widest">Selected Component</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-slate-300 font-bold mb-1 text-lg">Drop master seating plan</p>
                    <p className="text-slate-500 text-sm">XLSX, CSV or manual input support</p>
                  </div>
                )}
              </label>

              <button
                onClick={handlePreview}
                disabled={loading || !studentFile}
                className="w-full mt-10 bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-[24px] border border-white/10 hover:border-teal-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Simulating Space...' : 'Initialize Preview Engine'}
              </button>
              {error && <p className="mt-4 text-rose-400 text-xs font-bold text-center uppercase tracking-widest">{error}</p>}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 backdrop-blur-2xl border border-teal-500/20 rounded-[40px] p-10">
              <FiInfo className="text-teal-400 mb-6" size={32} />
              <h4 className="text-white font-serif text-2xl font-bold mb-4">Neural Allocation</h4>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 font-light">
                Our engine automatically handles branch distribution to minimize proximity between students from the same department.
              </p>
              <ul className="space-y-4">
                {[
                  'Supports custom room naming',
                  'Automated roll number sorting',
                  'Real-time capacity tracking',
                  'Manual override capability'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs text-teal-300/80 font-bold tracking-wide uppercase">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full shadow-[0_0_10px_#00e5c3]"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-10 border border-white/5 rounded-[40px] bg-white/[0.02]">
              <h5 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">System Status</h5>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-400">
                  <FiCheckSquare />
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Ready</p>
                  <p className="text-[10px] text-slate-500">Awaiting Data Core</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="space-y-12 animate-fade-up">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Rooms', value: previewData.rooms.length },
              { label: 'Total Capacity', value: previewData.rooms.reduce((acc, r) => acc + (r.rows * r.cols * 2), 0) },
              { label: 'Students Placed', value: previewData.total_students },
              { label: 'Unallocated', value: previewData.unallocated?.length || 0 },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-serif font-bold text-white uppercase tracking-widest leading-none">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-1 gap-12">
            {previewData.rooms.map((room) => {
              const roomData = previewData.assignedData[room.name];
              if (!roomData) return null;

              const pairs = roomData.pairs;
              const numColumns = 4;
              const rowsPerColumn = Math.ceil(pairs.length / numColumns);

              return (
                <div key={room.name} className="bg-card backdrop-blur-xl border border-white/10 rounded-[48px] overflow-hidden shadow-2xl">

                  <div className="bg-white/5 px-10 py-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <span className="text-teal-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-1 block">Component: {room.name}</span>
                      <h3 className="font-serif text-2xl font-bold text-white">{room.college || "Inst. Examination Cell"}</h3>
                    </div>
                    <div className="flex gap-8">
                      <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Students</p>
                        <p className="text-white font-bold">{pairs.reduce((acc, p) => acc + (p.s1 ? 1 : 0) + (p.s2 ? 1 : 0), 0)}</p>
                      </div>
                      <div className="w-px h-10 bg-white/5"></div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Capacity</p>
                        <p className="text-white font-bold">{room.rows * room.cols * 2}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-10">
                    <div className="bg-white/5 rounded-2xl p-3 text-center text-[10px] font-black tracking-[0.5em] text-cyan-400/40 uppercase mb-5 border border-white/5">
                      White Board Area
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                      {[...Array(numColumns)].map((_, colIndex) => {
                        const startIdx = colIndex * rowsPerColumn;
                        const endIdx = Math.min(startIdx + rowsPerColumn, pairs.length);
                        const columnPairs = pairs.slice(startIdx, endIdx);

                        if (columnPairs.length === 0) return null;

                        return (
                          <div key={colIndex} className="space-y-4">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-white/5 text-slate-500 text-[9px] uppercase font-black tracking-widest">
                                  <th className="pb-3 px-2">#</th>
                                  <th className="pb-3 px-2">S1</th>
                                  <th className="pb-3 px-2">S2</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/[0.02]">
                                {columnPairs.map((pair, i) => {
                                  const originalIndex = startIdx + i;
                                  return (
                                    <tr key={originalIndex} className="group">
                                      <td className="py-2.5 px-2 text-[10px] font-bold text-slate-700">{originalIndex + 1}</td>
                                      <td className="py-2.5 px-2">
                                        <input
                                          type="text"
                                          className="bg-transparent border-none outline-none text-[11px] text-white font-medium focus:text-teal-400 transition-colors w-full"
                                          value={pair.s1}
                                          onChange={(e) => handleStudentChange(room.name, originalIndex, 's1', e.target.value)}
                                        />
                                      </td>
                                      <td className="py-2.5 px-2">
                                        <input
                                          type="text"
                                          className="bg-transparent border-none outline-none text-[11px] text-white font-medium focus:text-cyan-400 transition-colors w-full"
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
                  </div>

                  {roomData.summary && (
                    <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5">
                      <div className="flex flex-wrap gap-4">
                        {Object.entries(roomData.summary).map(([branch, count]) => (
                          <div key={branch} className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{branch}</span>
                            <span className="text-xs font-serif font-black text-teal-400 tracking-widest">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}

export default SeatingPlanner;
