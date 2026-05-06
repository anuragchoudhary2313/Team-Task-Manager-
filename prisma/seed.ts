import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const memberPassword = await bcrypt.hash("member123", 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create Member
  const member = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {},
    create: {
      email: "member@example.com",
      name: "Member User",
      password: memberPassword,
      role: "MEMBER",
    },
  });

  // Create a Project
  const project = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Overhaul the company website with a modern look.",
      ownerId: admin.id,
    },
  });

  // Create some Tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Design Hero Section",
        description: "Create a vibrant hero section with animations.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        projectId: project.id,
        assignedToId: member.id,
      },
      {
        title: "Implement Auth Flow",
        description: "Set up login and signup pages.",
        status: "TODO",
        priority: "MEDIUM",
        projectId: project.id,
        assignedToId: admin.id,
      },
      {
        title: "Setup Database",
        description: "Initialize SQLite with Prisma.",
        status: "DONE",
        priority: "HIGH",
        projectId: project.id,
        assignedToId: admin.id,
      },
    ],
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
