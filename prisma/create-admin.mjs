import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "Admin";

if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  process.exit(1);
}

if (password.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

try {
  const passwordHash = await hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, name, passwordHash },
    update: { name, passwordHash },
  });

  console.log(`Admin user is ready: ${email}`);
} finally {
  await prisma.$disconnect();
}
