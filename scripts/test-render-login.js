const axios = require('axios');

const testRenderLogin = async () => {
  const url = 'https://api-priyankasolar-ct61.onrender.com/api/auth/login';
  const credentials = {
    email: 'admin@pssolarsolution.com',
    password: 'Admin@1234'
  };

  console.log(`Testing login POST to ${url} with:`, credentials);
  try {
    const res = await axios.post(url, credentials);
    console.log('LOGIN SUCCESSFUL! Response:', res.data);
  } catch (err) {
    console.log('LOGIN FAILED! Status:', err.response?.status, 'Response:', err.response?.data);
  }

  // Also try old emails if any
  const altEmails = ['info@pssolar.co.in', 'admin@priyankasolar.com', 'admin@pssolarsolution.com'];
  const altPasses = ['Admin@1234', 'Admin@123', 'admin123', '123456'];

  for (let e of altEmails) {
    for (let p of altPasses) {
      try {
        const res = await axios.post(url, { email: e, password: p });
        console.log(`FOUND WORKING CREDENTIALS on Render backend! Email: ${e} | Pass: ${p} | Data:`, res.data);
      } catch (err) {
        // silent fail
      }
    }
  }
};

testRenderLogin();
