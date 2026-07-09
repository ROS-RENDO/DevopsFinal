const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@servd.com',
      password,
      name: 'Admin User',
      role: 'admin',
    },
  });

  const company = await prisma.user.create({
    data: {
      email: 'company@servd.com',
      password,
      name: 'Sparkle Co.',
      role: 'company',
    },
  });

  const worker = await prisma.user.create({
    data: {
      email: 'worker@servd.com',
      password,
      name: 'Mike Worker',
      role: 'worker',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@servd.com',
      password,
      name: 'Jane Customer',
      role: 'customer',
    },
  });

  console.log('Seeding bookings...');
  
  await prisma.booking.createMany({
    data: [
      {
        serviceId: 's1',
        serviceName: 'Deep Cleaning',
        customerEmail: customer.email,
        date: new Date().toISOString(),
        status: 'pending',
      },
      {
        serviceId: 's2',
        serviceName: 'Pipe Repair',
        customerEmail: customer.email,
        date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        status: 'confirmed',
      },
    ],
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
