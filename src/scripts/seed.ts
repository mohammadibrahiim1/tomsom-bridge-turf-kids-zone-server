import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminId =
    process.env.SUPER_ADMIN_ID || 'su_admin_9f26k7';

  const name =
    process.env.SUPER_ADMIN_NAME || 'Super Admin';

  const email =
    process.env.SUPER_ADMIN_EMAIL ||
    'tomsomturfsuofficial@gmail.com';

  const username =
    process.env.SUPER_ADMIN_USERNAME ||
    'tomsomturfsuadmin2026';

  const rawPassword =
    process.env.SUPER_ADMIN_PASSWORD ||
    'TsTurf_2026_Kid@Zone!';

  console.log('🔄 Checking Super Admin...');

  const hashedPassword = await bcrypt.hash(rawPassword, 12);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username },
      ],
    },
  });

  if (existingUser) {
    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        password: hashedPassword,
        name,
        role: 'SUPER_ADMIN',
        isMustChangePassword: true,
        isEmailVerified: true,
        updatedAt: new Date(),
      },
    });

    console.log('✅ Super Admin updated successfully!');
  } else {
    await prisma.user.create({
      data: {
        id: adminId,
        username,
        name,
        email,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'APPROVED',
        isActive: true,
        isMustChangePassword: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isDeleted: false,
      },
    });

    console.log('✅ Super Admin created successfully!');
  }

  console.log('');
  console.log('=================================');
  console.log('       SUPER ADMIN DETAILS       ');
  console.log('=================================');
  console.log(`📧 Email: ${email}`);
  console.log(`👤 Username: ${username}`);
  console.log(`🔑 Password: ${rawPassword}`);
  console.log('=================================');
}

main()
  .catch((error: unknown) => {
    console.error('💥 Seeding Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });   