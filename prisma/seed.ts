import {
  PrismaClient,
  Role,
  TrailDifficulty,
} from "../app/generated/prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const SALT_ROUNDS = 12;

async function main() {
  console.log("🌱 Seeding database...");

  const adminPassword = await bcrypt.hash("Admin123!", SALT_ROUNDS);
  const employeePassword = await bcrypt.hash("Employee123!", SALT_ROUNDS);
  const userPassword = await bcrypt.hash("User123!", SALT_ROUNDS);

  // ======================
  // ADMIN
  // ======================

  await prisma.user.upsert({
    where: {
      email: "admin@epulag.com",
    },
    update: {},
    create: {
      firstName: "System",
      lastName: "Administrator",
      email: "admin@epulag.com",
      phone: "09171234567",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // ======================
  // EMPLOYEE 1
  // ======================

  await prisma.user.upsert({
    where: {
      email: "employee1@epulag.com",
    },
    update: {},
    create: {
      firstName: "Juan",
      lastName: "Dela Cruz",
      email: "employee1@epulag.com",
      phone: "09171234568",
      password: employeePassword,
      role: Role.EMPLOYEE,
    },
  });

  // ======================
  // EMPLOYEE 2
  // ======================

  await prisma.user.upsert({
    where: {
      email: "employee2@epulag.com",
    },
    update: {},
    create: {
      firstName: "Maria",
      lastName: "Santos",
      email: "employee2@epulag.com",
      phone: "09171234569",
      password: employeePassword,
      role: Role.EMPLOYEE,
    },
  });

  // ======================
  // USER 1
  // ======================

  await prisma.user.upsert({
    where: {
      email: "user1@epulag.com",
    },
    update: {},
    create: {
      firstName: "Isaiah",
      lastName: "Pili",
      email: "user1@epulag.com",
      phone: "09171234570",
      password: userPassword,
      role: Role.USER,
    },
  });

  // ======================
  // USER 2
  // ======================

  await prisma.user.upsert({
    where: {
      email: "user2@epulag.com",
    },
    update: {},
    create: {
      firstName: "John",
      lastName: "Smith",
      email: "user2@epulag.com",
      phone: "09171234571",
      password: userPassword,
      role: Role.USER,
    },
  });

  // ======================
  // USER 3
  // ======================

  await prisma.user.upsert({
    where: {
      email: "user3@epulag.com",
    },
    update: {},
    create: {
      firstName: "Jane",
      lastName: "Doe",
      email: "user3@epulag.com",
      phone: "09171234572",
      password: userPassword,
      role: Role.USER,
    },
  });

  // ======================
  // TRAILS
  // ======================

  await prisma.trail.upsert({
    where: {
      name: "Ambangeg Trail",
    },
    update: {},
    create: {
      name: "Ambangeg Trail",
      description:
        "The easiest and most popular trail to the summit of Mount Pulag.",
      difficulty: TrailDifficulty.EASY,
      maxCapacity: 500,
      isActive: true,
    },
  });

  await prisma.trail.upsert({
    where: {
      name: "Akiki Trail",
    },
    update: {},
    create: {
      name: "Akiki Trail",
      description:
        "Known as the Killer Trail because of its steep ascent.",
      difficulty: TrailDifficulty.DIFFICULT,
      maxCapacity: 500,
      isActive: true,
    },
  });

  await prisma.trail.upsert({
    where: {
      name: "Tawangan Trail",
    },
    update: {},
    create: {
      name: "Tawangan Trail",
      description:
        "A scenic trail passing through mossy forests and grasslands.",
      difficulty: TrailDifficulty.MODERATE,
      maxCapacity: 500,
      isActive: true,
    },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });