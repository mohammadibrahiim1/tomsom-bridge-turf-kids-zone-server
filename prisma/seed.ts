import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'process';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminId = process.env.SUPER_ADMIN_ID || 'su_admin_9f26k7';
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'tomsomturfsuofficial@gmail.com';
  const username = process.env.SUPER_ADMIN_USERNAME || 'tomsomturfsuadmin2026';
  const rawPassword = process.env.SUPER_ADMIN_PASSWORD || 'TsTurf_2026_Kid@Zone!';

  const hashedPassword = await bcrypt.hash(rawPassword, 12);

  const user = await prisma.user.upsert({
    where: {
      email: superAdminEmail,
    },
    update: {
      password: hashedPassword,
    },
    create: {
      id: adminId,
      username: username,
      name: name,
      email: superAdminEmail,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      isMustChangePassword: true,
      isEmailVerified: true,
    },
  });
}

main()
  .catch((e) => {
    console.error('💥 Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
