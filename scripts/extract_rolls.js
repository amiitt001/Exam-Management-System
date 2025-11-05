#!/usr/bin/env node
// Simple script to extract roll numbers from a PDF or plain text file.
// Usage: node scripts/extract_rolls.js "path/to/file.pdf"

const fs = require('fs');
const path = require('path');

async function extractFromPDF(filePath) {
  // lazy require to keep deps optional
  let pdfparse;
  try { pdfparse = require('pdf-parse'); } catch (e) {
    console.error('Missing dependency pdf-parse. Install with: npm install pdf-parse');
    process.exit(2);
  }
  const data = fs.readFileSync(filePath);
  const res = await pdfparse(data);
  return res.text || '';
}

function extractFromText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function findRolls(text) {
  if (!text) return [];
  // normalize spaces
  const normalized = text.replace(/\u00A0/g, ' ');

  // tokens are separated by whitespace or punctuation
  // We'll search for two patterns:
  // 1) Pure digit sequences >=6 (e.g., 2400970100108)
  // 2) Alphanumeric tokens that contain both letters and digits, length >=6 (e.g., 24GCEBCS003)
  const digitRegex = /\b\d{6,}\b/g;
  const alnumRegex = /\b(?=[A-Za-z0-9-]*[A-Za-z])(?=[A-Za-z0-9-]*\d)[A-Za-z0-9-]{6,}\b/g;

  const found = new Set();
  let m;
  while ((m = digitRegex.exec(normalized)) !== null) found.add(m[0]);
  while ((m = alnumRegex.exec(normalized)) !== null) found.add(m[0]);

  // As a fallback, also try to pick tokens that look like roll numbers when adjacent to keywords
  // (e.g., 'Reg No: 24009...')
  const fallback = /(?:reg(?:istration)?\s*(?:no\.?|num\.?|:)?|roll\s*(?:no\.?|num\.?|:)?|rn[:\s])\s*(\w{6,})/ig;
  while ((m = fallback.exec(normalized)) !== null) found.add(m[1]);

  // return as array in appearance order by scanning text and keeping those present
  const results = [];
  const seen = new Set();
  const ALL = Array.from(found);
  if (ALL.length === 0) return [];
  // find first appearances
  const tokens = normalized.split(/\s+/);
  for (const t of tokens) {
    const clean = t.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '');
    if (found.has(clean) && !seen.has(clean)) {
      results.push(clean);
      seen.add(clean);
    }
  }
  // append any not captured by token scan
  for (const v of ALL) if (!seen.has(v)) results.push(v);
  return results;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/extract_rolls.js <path-to-pdf-or-txt>');
    process.exit(1);
  }
  const filePath = path.resolve(arg);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const ext = path.extname(filePath).toLowerCase();
  let text = '';
  try {
    if (ext === '.pdf') text = await extractFromPDF(filePath);
    else text = extractFromText(filePath);
  } catch (err) {
    console.error('Failed to extract text:', err.message || err);
    process.exit(2);
  }

  const rolls = findRolls(text);
  if (rolls.length === 0) {
    console.log('No roll numbers found.');
    process.exit(0);
  }

  // print one per line
  const out = rolls.join('\n');
  console.log(out);

  // also write to output file next to input
  const outPath = filePath + '.rolls.txt';
  fs.writeFileSync(outPath, out, 'utf8');
  console.log('Saved rolls to', outPath);
}

main().catch(e => { console.error(e); process.exit(2); });
