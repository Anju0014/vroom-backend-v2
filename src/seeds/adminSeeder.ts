import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Admin } from '@models/admin/adminModel';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB!');

    const existingAdmin = await Admin.findOne({ email: 'admin@vroom.com' });
    if (existingAdmin) {
      console.log('Admin already exists. No action needed.');
      await mongoose.connection.close();
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new Admin({
      email: 'admin@vroom.com',
      password: hashedPassword,
    });

    await admin.save();
    console.log('Admin created successfully!');

    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
