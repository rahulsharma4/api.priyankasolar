const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, 'results.txt');
fs.writeFileSync(logFile, 'STARTING SCRIPT...\n');

function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

const axios = require('axios');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  log('Connecting to Mongo: ' + process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI);
  log('Connected! DB name: ' + mongoose.connection.name);

  const User = require('../src/models/userModel');
  const targetEmail = 'admin@pssolarsolution.com';
  const targetPass = 'Admin@1234';

  let admin = await User.findOne({ email: targetEmail });
  if (!admin) {
    log('Admin not found, creating...');
    admin = new User({
      name: 'Admin PS Solar',
      email: targetEmail,
      phone: '9999999999',
      password: targetPass,
      role: 'admin',
      status: 'active',
      isDeleted: false
    });
    await admin.save();
    log('Admin created.');
  } else {
    log('Admin found, updating...');
    admin.name = 'Admin PS Solar';
    admin.password = targetPass;
    admin.role = 'admin';
    admin.status = 'active';
    admin.isDeleted = false;
    await admin.save();
    log('Admin updated.');
  }

  const match = await admin.matchPassword(targetPass);
  log(`Bcrypt match for ${targetEmail} with ${targetPass}: ` + match);

  // Check all users
  const users = await User.find({});
  log(`Total users in DB: ${users.length}`);
  for (let u of users) {
    log(`- Email: ${u.email} | Role: ${u.role} | Status: ${u.status} | Deleted: ${u.isDeleted}`);
  }

  log('Testing Render live API login...');
  try {
    const res = await axios.post('https://api-priyankasolar-ct61.onrender.com/api/auth/login', {
      email: targetEmail,
      password: targetPass
    }, { timeout: 15000 });
    log('LIVE RENDER LOGIN SUCCESS! Data: ' + JSON.stringify(res.data));
  } catch (err) {
    log('LIVE RENDER LOGIN FAILED! Status: ' + err.response?.status + ' Message: ' + JSON.stringify(err.response?.data || err.message));
  }

  process.exit(0);
}

run().catch(err => {
  log('SCRIPT ERROR: ' + err.stack);
  process.exit(1);
});
