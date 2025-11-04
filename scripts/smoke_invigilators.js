const http = require('http');

const data = JSON.stringify({
  invigilators: [
    { id: 'I1', name: 'Dr. A' },
    { id: 'I2', name: 'Prof. B' },
    { id: 'I3', name: 'Ms. C' }
  ],
  sessions: [
    { id: 'S1', exam: 'Math-101', room: 'RoomA', time: '09:00-11:00' },
    { id: 'S2', exam: 'Chem-101', room: 'RoomB', time: '09:00-11:00' },
    { id: 'S3', exam: 'Phys-101', room: 'RoomC', time: '12:00-14:00' },
    { id: 'S4', exam: 'Bio-101', room: 'RoomD', time: '12:00-14:00' },
    { id: 'S5', exam: 'CS-101', room: 'RoomE', time: '15:00-17:00' }
  ]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/assign-invigilators-mock',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log('Response:');
      console.log(JSON.stringify(json, null, 2));
    } catch (err) {
      console.error('Failed to parse response:', err);
      console.log('Raw:', body);
    }
  });
});

req.on('error', (e) => { console.error(`Problem with request: ${e.message}`); });
req.write(data);
req.end();
