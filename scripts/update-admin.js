const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/userModel');

dotenv.config();

const updateAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected successfully!');

    const targetEmail = 'admin@pssolarsolution.com';
    const targetPassword = 'Admin@1234';
    const targetName = 'Admin PS Solar';

    // Find any existing admin accounts or users with target email
    let admins = await User.find({ $or: [{ role: 'admin' }, { email: targetEmail }, { email: 'admin@priyankasolar.com' }, { email: 'info@pssolar.co.in' }] });

    if (admins.length > 0) {
      console.log(`Found ${admins.length} admin accounts. Updating all to ${targetEmail} / ${targetPassword}...`);
      for (let admin of admins) {
        admin.name = targetName;
        admin.email = targetEmail;
        admin.password = targetPassword;
        admin.status = 'active';
        admin.isDeleted = false;
        await admin.save();
        console.log(`Updated admin ID: ${admin._id} -> ${targetEmail}`);
      }
    } else {
      console.log('No admin account found. Creating new admin user...');
      const admin = new User({
        name: targetName,
        email: targetEmail,
        phone: '9999999999',
        password: targetPassword,
        role: 'admin',
        status: 'active',
        isDeleted: false
      });
      await admin.save();
      console.log(`Created new admin user: ${targetEmail}`);
    }

    console.log('--------------------------------------------------');
    console.log('Admin User Reset Completed Successfully in Database.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin:', error);
    process.exit(1);
  }
};

updateAdmin();
