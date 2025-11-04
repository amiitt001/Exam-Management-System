const http = require('http');

const data = JSON.stringify({
  students: [
    { id: 'S1', name: 'Alice' },
    { id: 'S2', name: 'Bob' },
    { id: 'S3', name: 'Charlie' },
    { id: 'S4', name: 'David' },
    { id: 'S5', name: 'Eve' }
  ],
  rooms: [
    { name: 'RoomA', capacity: 2 },
    { name: 'RoomB', capacity: 2 }
  ]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/assign-seats-mock',
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
