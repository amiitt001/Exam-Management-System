import React, { useState, useRef } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

const SeatingArrangement = () => {
  const [studentsText, setStudentsText] = useState('');
  const [roomsText, setRoomsText] = useState('RoomA:30\nRoomB:25');
  const [assignments, setAssignments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedPreview, setParsedPreview] = useState([]);
  const [parsedCount, setParsedCount] = useState(0);
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState(null);
  const [parsedData, setParsedData] = useState(null); // array of objects or arrays
  const [csvColumns, setCsvColumns] = useState([]);
  const [showMappingUI, setShowMappingUI] = useState(false);
  const [mapping, setMapping] = useState({ rollColumn: '', nameColumn: '' });
  const [appendMode, setAppendMode] = useState(false);

  // Utility: extract a roll number from a text line.
  // Strategy: prefer explicit columns named like roll/rollno/registration, else find the first token
  // with >=6 consecutive digits or an alphanumeric token that looks like a roll (digits + letters).
  const extractRollFromString = (line) => {
    if (!line) return null;
    // normalize whitespace
    const clean = line.replace(/\u00A0/g, ' ').trim();
    // common separators
    const tokens = clean.split(/[,\s\t|;]+/).map(t => t.trim()).filter(Boolean);

    // first look for token that is mostly digits (>=6 digits)
    for (const t of tokens) {
      const digitsMatch = t.match(/\d{6,}/);
      if (digitsMatch) return digitsMatch[0];
    }

    // fallback: find alphanumeric token (letters+digits) length >=6
    for (const t of tokens) {
      if (/^(?=.*\d)(?=.*[A-Za-z])[A-Za-z0-9\-]{6,}$/.test(t)) return t;
    }

    // nothing match
    return null;
  };

  // Parse students: one per line (extract roll no if present)
  const parseStudents = (text) => text.split('\n').map(s => s.trim()).filter(Boolean).map((s, i) => {
    const roll = extractRollFromString(s);
    if (roll) {
      // remove roll from name when possible
      const name = s.replace(roll, '').replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '').trim();
      return { id: roll, name: name || roll };
    }
    return { id: `S${i+1}`, name: s };
  });

  // Parse a CSV string to an array of names (or id:name if provided)
  const parseCSV = (csv) => {
    const lines = csv.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    // detect header
    const first = lines[0];
    const hasComma = first.indexOf(',') >= 0;
    const rows = lines.map(l => l.split(',').map(c=>c.trim()));

    // If header row contains name/id/roll, use header mapping
    let startIdx = 0;
    let nameIdx = 0;
    let idIdx = -1;
    if (hasComma) {
      const header = rows[0].map(h => h.toLowerCase());
      // detect roll-like header names
      const rollHeaders = ['roll', 'rollno', 'roll_no', 'registration', 'regno', 'reg_no', 'studentid', 'id'];
      const nameHeaders = ['name', 'full_name', 'student', 'student_name'];
      for (let i = 0; i < header.length; i++) {
        if (rollHeaders.includes(header[i])) idIdx = i;
        if (nameHeaders.includes(header[i])) nameIdx = i;
      }
      if (idIdx >= 0 || header.some(h => nameHeaders.includes(h))) startIdx = 1;
    }

    const out = [];
    for (let i = startIdx; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length === 0) continue;
      // join row into a single line to search for roll patterns
      const line = r.join(' ');
      // prefer explicit id column if present
      let id = (idIdx >= 0 ? (r[idIdx] || '') : '') || '';
      const rollFound = extractRollFromString(line);
      if (!id && rollFound) id = rollFound;
      // determine name
      let name = (nameIdx >= 0 && r[nameIdx]) ? r[nameIdx] : '';
      if (!name) {
        // remove id from line to create a name candidate
        if (id) name = line.replace(id, '').replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '').trim();
        else name = line;
      }
      out.push({ id: id || `p${i}`, name: name });
    }
    return out;
  };

  // Parse rooms: lines like "RoomA:30"
  const parseRooms = (text) => text.split('\n').map(r=>r.trim()).filter(Boolean).map(line => {
    const [name, cap] = line.split(':').map(x=>x.trim());
    return { name, capacity: Number(cap) || 0 };
  });

  const handleAssign = async (e) => {
    e.preventDefault();
    setError(null);
    setAssignments(null);
    const students = parseStudents(studentsText);
    const rooms = parseRooms(roomsText);
    if (students.length === 0) { setError('No students provided'); return; }
    if (rooms.length === 0) { setError('No rooms provided'); return; }

    setLoading(true);
    try {
      const resp = await axios.post('http://localhost:5000/api/assign-seats-mock', { students, rooms });
      setAssignments(resp.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Drag & drop handlers
  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
  const onDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer?.files || [];
    if (files.length > 0) handleFile(files[0]);
  };

  const handleFile = async (file) => {
    if (!file) return;
    // Basic validation: accept only CSV or plain text to avoid showing binary PDF data
    const maxSize = 8 * 1024 * 1024; // 8 MB
    const ext = (file.name || '').split('.').pop().toLowerCase();
    const isTextMime = (file.type || '').startsWith('text');
  const allowedExt = ['csv', 'txt', 'pdf'];
    if (!isTextMime && !allowedExt.includes(ext)) {
      setFileError('Unsupported file type. Please upload a CSV (.csv) or plain text file. If you intended to import from a PDF, export it to CSV first.');
      return;
    }
    if (file.size > maxSize) {
      setFileError(`File is too large (${Math.round(file.size/1024)} KB). Max ${Math.round(maxSize/1024/1024)} MB.`);
      return;
    }
    setFileError(null);
    setError(null);

    try {
      // If PDF, use pdfjs to extract text
      if (ext === 'pdf' || file.type === 'application/pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
          // load worker from CDN matching the library version
          try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          } catch (e) {
            // ignore if workerSrc cannot be set
          }

          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p);
            const content = await page.getTextContent();
            const strings = content.items.map(i => i.str);
            fullText += strings.join(' ') + '\n';
          }
          const rows = parseCSV(fullText);
          setParsedCount(rows.length);
          setParsedPreview(rows.slice(0, 12));
          setStudentsText(rows.map(r => r.name || r.id).join('\n'));
          return;
        } catch (pdfErr) {
          setFileError('Failed to parse PDF. Try exporting the roster to CSV instead.');
          return;
        }
      }

      // Fallback: read as text (CSV or plain text) and parse robustly with PapaParse
      const text = await file.text();
      // Try parsing with header detection
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      if (parsed && parsed.meta && parsed.meta.fields && parsed.meta.fields.length > 0) {
        // we have headers
        setCsvColumns(parsed.meta.fields.slice());
        setParsedData(parsed.data.slice());
        setParsedCount(parsed.data.length);
        setParsedPreview(parsed.data.slice(0, 12));
        setShowMappingUI(true);
        // default auto-map: try to find common roll and name headers
        const lower = parsed.meta.fields.map(f => f.toLowerCase());
        const rollCandidates = ['roll', 'rollno', 'roll_no', 'registration', 'regno', 'studentid', 'id'];
        const nameCandidates = ['name', 'full_name', 'student', 'student_name'];
        const rollIdx = lower.findIndex(h => rollCandidates.includes(h));
        const nameIdx = lower.findIndex(h => nameCandidates.includes(h));
        setMapping({
          rollColumn: rollIdx >= 0 ? parsed.meta.fields[rollIdx] : (parsed.meta.fields[0] || ''),
          nameColumn: nameIdx >= 0 ? parsed.meta.fields[nameIdx] : (parsed.meta.fields[1] || parsed.meta.fields[0] || '')
        });
      } else {
        // no headers: parse as arrays
        const parsed2 = Papa.parse(text, { header: false, skipEmptyLines: true });
        const data = parsed2.data || [];
        const maxCols = Math.max(0, ...data.map(row => row.length));
        const cols = Array.from({ length: maxCols }, (_, i) => `Column ${i+1}`);
        setCsvColumns(cols);
        setParsedData(data.slice());
        setParsedCount(data.length);
        setParsedPreview(data.slice(0, 12));
        setShowMappingUI(true);
        setMapping({ rollColumn: cols[0] || '', nameColumn: cols[1] || cols[0] || '' });
      }
    } catch (err) {
      setFileError('Failed to read file');
    }
  };

  const onSelectFile = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const applyMapping = () => {
    if (!parsedData || !csvColumns || csvColumns.length === 0) return;
    const rows = [];
    // parsedData may be array of objects (header) or array of arrays
    if (parsedData.length === 0) return;
    const isObjects = typeof parsedData[0] === 'object' && !Array.isArray(parsedData[0]);
    for (const row of parsedData) {
      let roll = '';
      let name = '';
      if (isObjects) {
        roll = row[mapping.rollColumn] || '';
        name = row[mapping.nameColumn] || '';
      } else {
        const idxRoll = csvColumns.indexOf(mapping.rollColumn);
        const idxName = csvColumns.indexOf(mapping.nameColumn);
        roll = row[idxRoll] || '';
        name = row[idxName] || '';
      }
      // fallback: try extractRollFromString from joined row
      if (!roll) {
        const joined = (isObjects ? Object.values(row).join(' ') : row.join(' '));
        roll = extractRollFromString(joined) || '';
      }
      // choose what to put in textarea: prefer roll if found, otherwise name
      rows.push( (roll && String(roll).trim()) || (name && String(name).trim()) || '' );
    }
    const filtered = rows.map(r=>r.trim()).filter(Boolean);
    const newText = filtered.join('\n');
    if (appendMode && studentsText.trim()) {
      // append unique lines
      const existing = studentsText.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
      const combined = existing.concat(filtered);
      setStudentsText(combined.join('\n'));
    } else {
      setStudentsText(newText);
    }
    // hide mapping after apply
    setShowMappingUI(false);
    setParsedPreview([]);
    setParsedData(null);
    setParsedCount(0);
  };

  // clear file error when user interacts with dropzone
  const onDropzoneInteract = () => setFileError(null);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Seating Arrangement Planner</h2>
      <form onSubmit={handleAssign} className="space-y-4 max-w-3xl">
        <div>
          <label className="block text-sm font-medium text-gray-300">Students (one per line, name or id)</label>

          <div
            onDragOver={(e)=>{ onDragOver(e); onDropzoneInteract(); }}
            onDragLeave={(e)=>{ onDragLeave(e); }}
            onDrop={(e)=>{ onDrop(e); }}
            className={`mt-2 w-full rounded px-3 py-6 text-sm border-2 ${dragActive ? 'border-teal-400 bg-gray-900/60' : 'border-dashed border-gray-700 bg-gray-900'}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="text-gray-400">Drag & drop a CSV file here to import students (header: name or id,name)</div>
              <div>
                <button type="button" onClick={()=>{ setFileError(null); fileInputRef.current?.click(); }} className="text-sm text-teal-300 underline">Select file</button>
                <input ref={fileInputRef} type="file" accept=".csv,text/csv,.txt,text/plain" onChange={onSelectFile} className="hidden" />
              </div>
            </div>
          </div>

          {fileError && <p className="mt-2 text-sm text-red-400">{fileError}</p>}

          <textarea value={studentsText} onChange={e=>setStudentsText(e.target.value)} rows={8} className="mt-3 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm" placeholder="Alice\nBob\nCharlie" />

          {parsedPreview.length > 0 && (
            <div className="mt-3 text-sm text-gray-300">
              <div className="mb-1">Parsed {parsedCount} students — preview:</div>
              <ol className="list-decimal list-inside max-h-36 overflow-auto space-y-1">
                {parsedPreview.map((p, idx) => (
                  <li key={idx}>
                    {typeof p === 'object' && !Array.isArray(p) ? (
                      <span>{(p[mapping.rollColumn] || p[mapping.nameColumn] || Object.values(p)[0] || '').toString()}</span>
                    ) : (
                      <span>{(Array.isArray(p) ? p.join(' ') : p)}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {showMappingUI && (
            <div className="mt-4 p-3 bg-gray-900 border border-gray-700 rounded">
              <div className="flex items-center gap-4 mb-2">
                <div className="text-sm text-gray-300">Map CSV columns to fields</div>
                <label className="ml-auto flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={appendMode} onChange={e=>setAppendMode(e.target.checked)} className="" />
                  <span className="text-xs">Append to existing list</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Roll / ID column</label>
                  <select value={mapping.rollColumn} onChange={e=>setMapping(m=>({...m, rollColumn: e.target.value}))} className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm">
                    {csvColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Name column</label>
                  <select value={mapping.nameColumn} onChange={e=>setMapping(m=>({...m, nameColumn: e.target.value}))} className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm">
                    <option value="">(none)</option>
                    {csvColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3 flex gap-3">
                <button type="button" onClick={applyMapping} className="px-3 py-1 bg-teal-500 text-white rounded text-sm">Import mapped columns</button>
                <button type="button" onClick={()=>{ setShowMappingUI(false); setParsedData(null); setParsedPreview([]); }} className="px-3 py-1 bg-gray-700 text-gray-200 rounded text-sm">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Rooms (one per line as Name:capacity)</label>
          <textarea value={roomsText} onChange={e=>setRoomsText(e.target.value)} rows={4} className="mt-2 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm" placeholder="RoomA:30\nRoomB:25" />
        </div>

        <div>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 active:scale-95 transition-transform text-white px-4 py-2 rounded-md">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-teal-400 rounded-full animate-spin" aria-hidden />}
            <span>{loading ? 'Assigning...' : 'Generate Seating'}</span>
          </button>
        </div>
      </form>

      {error && <div style={{color:'red', marginTop:12}}>Error: {error}</div>}

      {assignments && (
        <div style={{marginTop:20, textAlign:'left'}}>
          <h3>Assignments</h3>
          {assignments.rooms.map((r, ridx) => (
            <div key={r.name} className="opacity-0 animate-fade-up" aria-hidden style={{animationDelay:`${ridx*30}ms`, marginBottom:12}}>
              <strong>{r.name} (capacity: {r.capacity})</strong>
              <ol>
                {r.assigned.map((s, i) => (
                  <li key={s.id} className="opacity-0 animate-fade-up" style={{animationDelay:`${i*20}ms`}}>{s.name} <em>({s.id})</em> — Seat {i+1}</li>
                ))}
              </ol>
            </div>
          ))}
          {assignments.unassigned && assignments.unassigned.length > 0 && (
            <div style={{color:'orange'}}>
              <h4>Unassigned students (no seats available)</h4>
              <ul>
                {assignments.unassigned.map((s, i) => <li key={s.id} className="opacity-0 animate-fade-up" style={{animationDelay:`${i*30}ms`}}>{s.name} ({s.id})</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeatingArrangement;