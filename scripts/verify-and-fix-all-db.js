const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const verifyAndFix = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas!');

    const adminDb = mongoose.connection.db.admin();
    const dbsList = await adminDb.listDatabases();
    console.log('Databases in cluster:', dbsList.databases.map(d => d.name));

    const User = require('../src/models/userModel');

    // Fetch all users in current database
    const users = await User.find({});
    console.log(`Found ${users.length} total users in current database (${mongoose.connection.db.databaseName}):`);

    const targetEmail = 'admin@pssolarsolution.com';
    const targetPassword = 'Admin@1234';

    for (let u of users) {
      const match = await bcrypt.compare(targetPassword, u.password);
      console.log(`- User ID: ${u._id} | Email: ${u.email} | Role: ${u.role} | Status: ${u.status} | Deleted: ${u.isDeleted} | Password Matches 'Admin@1234': ${match}`);
    }

    // Now let's ensure targetEmail exists with Admin@1234
    let targetUser = await User.findOne({ email: targetEmail });
    if (!targetUser) {
      console.log(`Creating fresh admin user: ${targetEmail}`);
      targetUser = new User({
        name: 'Admin PS Solar',
        email: targetEmail,
        phone: '9999999999',
        password: targetPassword,
        role: 'admin',
        status: 'active',
        isDeleted: false
      });
      await targetUser.save();
    } else {
      console.log(`Resetting password for ${targetEmail}`);
      targetUser.name = 'Admin PS Solar';
      targetUser.password = targetPassword;
      targetUser.role = 'admin';
      targetUser.status = 'active';
      targetUser.isDeleted = false;
      await targetUser.save();
    }

    // Re-verify password match
    const updatedUser = await User.findOne({ email: targetEmail });
    const verifyMatch = await updatedUser.matchPassword(targetPassword);
    console.log(`Re-verification: User ${updatedUser.email} password match with '${targetPassword}': ${verifyMatch}`);

    process.exit(0);
  } catch (err) {
    console.error('Error in verifyAndFix:', err);
    process.exit(1);
  }
};

verifyAndFix();
