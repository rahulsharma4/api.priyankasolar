const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const forceUpdateAdmin = async () => {
  try {
    console.log('Connecting to MongoDB Atlas:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully to database:', mongoose.connection.name);

    const User = require('../src/models/userModel');

    const targetEmail = 'admin@pssolarsolution.com';
    const targetPassword = 'Admin@1234';

    // 1. Check if target admin exists
    let admin = await User.findOne({ email: targetEmail });
    
    // Hash password using bcrypt directly
    const hashedPassword = await bcrypt.hash(targetPassword, 8);

    if (!admin) {
      console.log(`Creating new admin user for ${targetEmail}...`);
      admin = new User({
        name: 'Admin PS Solar',
        email: targetEmail,
        phone: '9999999999',
        password: targetPassword, // pre-save hook will hash if created via mongoose, but let's be thorough
        role: 'admin',
        status: 'active',
        isDeleted: false
      });
      await admin.save();
      console.log('Admin created via Mongoose save.');
    } else {
      console.log(`Updating existing user ${targetEmail}...`);
      // Update directly via MongoDB query to ensure hash is set without pre-save complications
      await User.updateOne(
        { email: targetEmail },
        { 
          $set: { 
            name: 'Admin PS Solar',
            password: hashedPassword,
            role: 'admin',
            status: 'active',
            isDeleted: false
          } 
        }
      );
      console.log('Admin document updated in MongoDB.');
    }

    // Deactivate/remove any old admin accounts to ensure ONLY admin@pssolarsolution.com can log in as admin
    const oldAdmins = await User.find({ role: 'admin', email: { $ne: targetEmail } });
    console.log(`Found ${oldAdmins.length} old admin users to deactivate:`);
    for (let oldUser of oldAdmins) {
      console.log(`Deactivating old admin: ${oldUser.email}`);
      await User.updateOne({ _id: oldUser._id }, { $set: { status: 'inactive', isDeleted: true } });
    }

    // Verify bcrypt comparison with targetPassword
    const verifyUser = await User.findOne({ email: targetEmail });
    const isMatch = await bcrypt.compare(targetPassword, verifyUser.password);
    console.log(`SUCCESS: User ${verifyUser.email} password verification against '${targetPassword}' = ${isMatch}`);

    process.exit(0);
  } catch (err) {
    console.error('Error updating DB admin:', err);
    process.exit(1);
  }
};

forceUpdateAdmin();
