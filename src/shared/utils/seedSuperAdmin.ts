import dotenv from 'dotenv';
dotenv.config();
import { User } from '../../modules/user/user.model';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Database connected for seeding...');

    const isSuperAdminExist = await User.findOne({ role: 'SUPER_ADMIN' });

    if (!isSuperAdminExist) {
      const plainPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const superAdminData: Record<string, unknown> = {
        name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
        username: process.env.SUPER_ADMIN_USERNAME || 'superadmin',
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@gmail.com',
        phone: process.env.SUPER_ADMIN_PHONE || '01700000000',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'APPROVED',
        is_active: true,
      };

      

      await User.create(superAdminData);

      console.log('✨ Super Admin created successfully!');
    } else {
      console.log('⚠️ Super Admin already exists!');
    }
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
};

seedSuperAdmin();