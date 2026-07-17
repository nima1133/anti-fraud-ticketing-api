// prisma/seed.ts

import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  // ------------------------
  // Admin User
  // ------------------------

  let admin = await prisma.user.findUnique({
    where: {
      email: 'admin@example.com',
    },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin created');
  }

  // ------------------------
  // Test User
  // ------------------------

  const user = await prisma.user.findUnique({
    where: {
      email: 'user@example.com',
    },
  });

  if (!user) {
    await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'user@example.com',
        password: hashedPassword,
        role: 'USER',
      },
    });

    console.log('✅ Test user created');
  }

  // ------------------------
  // Events
  // ------------------------

  const events = [
    {
      title: 'Taylor Swift Concert',
      description: 'The Eras Tour',
      location: 'Tehran',
      capacity: 100,
      date: new Date('2026-08-20T20:00:00Z'),
    },
    {
      title: 'Coldplay Live',
      description: 'World Tour',
      location: 'London',
      capacity: 150,
      date: new Date('2026-09-10T19:30:00Z'),
    },
    {
      title: 'Champions League Final',
      description: 'Football Match',
      location: 'Madrid',
      capacity: 300,
      date: new Date('2026-10-05T18:00:00Z'),
    },
    {
      title: 'Tech Conference 2026',
      description: 'Backend & Cloud',
      location: 'Berlin',
      capacity: 250,
      date: new Date('2026-11-01T09:00:00Z'),
    },
  ];

  for (const event of events) {
    const exists = await prisma.event.findUnique({
      where: {
        title: event.title,
      },
    });

    if (!exists) {
      await prisma.event.create({
        data: {
          ...event,
          createdById: admin.id,
        },
      });

      console.log(`✅ ${event.title} created`);
    }
  }

  console.log('🎉 Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
