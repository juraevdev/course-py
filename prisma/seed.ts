import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_TEACHER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_TEACHER_PASSWORD;
  const name = process.env.SEED_TEACHER_NAME?.trim() || "O‘qituvchi";

  if (!email || !password || password.length < 8) {
    throw new Error(
      "SEED_TEACHER_EMAIL va SEED_TEACHER_PASSWORD (.env) majburiy (parol ≥ 8).",
    );
  }

  await prisma.notification.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignmentTest.deleteMany();
  await prisma.topicQuestion.deleteMany();
  await prisma.studentNote.deleteMany();
  await prisma.topicView.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.rateLimitBucket.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.cohortMember.deleteMany();
  await prisma.cohort.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: Role.TEACHER,
    },
  });

  console.log("Seed tayyor.");
  console.log(`O‘qituvchi: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
