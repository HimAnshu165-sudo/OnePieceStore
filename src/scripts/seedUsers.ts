import connectToDatabase from '../lib/mongodb';
import User from '../models/User';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function seedUsers() {
  console.log('Connecting to database...');
  await connectToDatabase();
  console.log('Connected to MongoDB successfully.');

  const accounts: { name: string; email: string; password: string; role: 'user' | 'admin' }[] = [
    {
      name: 'Commander Kyojuro',
      email: 'admin@demonslayer.store',
      password: 'Admin@123',
      role: 'admin',
    },
    {
      name: 'Admiral Fleet Commander',
      email: 'admin@onepiece-store.com',
      password: 'AdminOnePiece2026!',
      role: 'admin',
    },
    {
      name: 'Tanjiro Kamado',
      email: 'tanjiro@demonslayer.store',
      password: 'Demon@123',
      role: 'user',
    },
    {
      name: 'Monkey D. Luffy',
      email: 'luffy@onepiece-store.com',
      password: 'PirateKing2026!',
      role: 'user',
    },
  ];

  for (const acc of accounts) {
    const existing = await User.findOne({ email: acc.email.toLowerCase() });
    if (existing) {
      existing.name = acc.name;
      existing.role = acc.role as any;
      existing.password = acc.password; // pre-save hook will hash it
      await existing.save();
      console.log(`✅ Updated account: ${acc.email} (${acc.role})`);
    } else {
      await User.create(acc);
      console.log(`✅ Created account: ${acc.email} (${acc.role})`);
    }
  }

  const all = await User.find({}).lean();
  console.log('\nCurrent users in DB:', all.map(u => ({ email: u.email, role: u.role, name: u.name })));
  await mongoose.disconnect();
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error('Error seeding users:', err);
  process.exit(1);
});
