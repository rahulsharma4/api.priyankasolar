const axios = require('axios');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'render_live_out.txt');
fs.writeFileSync(logFile, 'STARTING LIVE RENDER TEST...\n');

function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

async function test() {
  const url = 'https://api-priyankasolar-ct61.onrender.com/api/auth/login';

  const testCases = [
    { email: 'admin@pssolarsolution.com', password: 'Admin@1234' },
    { email: 'admin@pssolarsolution.com', password: 'Admin@123' },
    { email: 'info@pssolar.co.in', password: 'Admin@1234' },
    { email: 'info@pssolar.co.in', password: 'Admin@123' },
    { email: 'admin@priyankasolar.com', password: 'Admin@1234' }
  ];

  for (let tc of testCases) {
    log(`Trying: ${tc.email} / ${tc.password}...`);
    try {
      const res = await axios.post(url, tc);
      log(`>>> SUCCESS for ${tc.email} / ${tc.password}: ` + JSON.stringify(res.data));
    } catch (err) {
      log(`>>> FAILED (${err.response?.status}): ` + JSON.stringify(err.response?.data || err.message));
    }
  }

  process.exit(0);
}

test();
