import connectToDatabase from '../lib/mongodb';
import User from '../models/User';
import mongoose from 'mongoose';

async function createAdmin() {
  const name = process.env.ADMIN_NAME || 'Fleet Admiral';
  const email = (process.env.ADMIN_EMAIL || 'admin@onepiece-store.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'AdminOnePiece2026!';

  console.log('\n========================================');
  console.log('   ONEPIECE STORE - ADMIN SEED SCRIPT');
  console.log('========================================\n');
  console.log(`Target Admin Name:  ${name}`);
  console.log(`Target Admin Email: ${email}`);

  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to MongoDB successfully.');

    // Check if user already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log(`\nℹ️ Admin account with email "${email}" already exists.`);
        console.log(`Admin ID: ${existingAdmin._id.toString()}`);
      } else {
        console.log(`\n⚠️ User with email "${email}" already exists with role "${existingAdmin.role}".`);
        console.log('Promoting user to "admin" role...');
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`✅ Successfully updated user to "admin" role.`);
      }
    } else {
      console.log('\nCreating new admin account...');
      const newAdmin = await User.create({
        name,
        email,
        password,
        role: 'admin',
      });
      console.log(`✅ Admin account created successfully!`);
      console.log(`Admin ID: ${newAdmin._id.toString()}`);
      console.log(`Role:     ${newAdmin.role}`);
    }

    console.log('\n========================================');
    console.log('   ADMIN SEEDING COMPLETED');
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ Error during admin seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  }
}

createAdmin();
