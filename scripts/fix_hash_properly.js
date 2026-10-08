const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const logFile = path.join(__dirname, 'fix_out.txt');
fs.writeFileSync(logFile, 'STARTING HASH FIX...\n');

function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

dotenv.config({ path: path.join(__dirname, '../.env') });

async function fix() {
  log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  log('Connected! Database: ' + mongoose.connection.name);

  const targetEmail = 'admin@pssolarsolution.com';
  const rawPassword = 'Admin@1234';

  // Generate SINGLE hash
  const singleHash = await bcrypt.hash(rawPassword, 8);
  log('Generated single hash: ' + singleHash);

  // Test compare
  const testCompare = await bcrypt.compare(rawPassword, singleHash);
  log('Test compare against single hash: ' + testCompare);

  // Use raw MongoDB collection update (bypassing Mongoose pre-save hooks!)
  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');

  // Also update old admin accounts if any exist with different emails (e.g. info@pssolar.co.in or admin@priyankasolar.com)
  await usersCollection.updateMany(
    { role: 'admin', email: { $ne: targetEmail } },
    { $set: { status: 'inactive', isDeleted: true } }
  );

  const updateResult = await usersCollection.updateOne(
    { email: targetEmail },
    {
      $set: {
        name: 'Admin PS Solar',
        email: targetEmail,
        password: singleHash,
        role: 'admin',
        status: 'active',
        isDeleted: false,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  log('Update result: ' + JSON.stringify(updateResult));

  // Re-verify from DB
  const fetchedUser = await usersCollection.findOne({ email: targetEmail });
  log('Fetched user from DB email: ' + fetchedUser.email);

  const finalMatch = await bcrypt.compare(rawPassword, fetchedUser.password);
  log('FINAL BCRYPT COMPARE RESULT IN DB FOR Admin@1234: ' + finalMatch);

  process.exit(0);
}

fix().catch(err => {
  log('FIX ERROR: ' + err.stack);
  process.exit(1);
});
