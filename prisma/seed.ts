import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("kurs1234", 10);

  const teacher = await prisma.user.create({
    data: {
      name: "Malika Karimova",
      email: "oqituvchi@kurs.uz",
      passwordHash,
      role: Role.TEACHER,
    },
  });

  const students = await Promise.all([
    prisma.user.create({
      data: {
        name: "Jasur Alimov",
        email: "jasur@kurs.uz",
        passwordHash,
        role: Role.STUDENT,
      },
    }),
    prisma.user.create({
      data: {
        name: "Dilnoza Rahimova",
        email: "dilnoza@kurs.uz",
        passwordHash,
        role: Role.STUDENT,
      },
    }),
    prisma.user.create({
      data: {
        name: "Sardor Yusupov",
        email: "sardor@kurs.uz",
        passwordHash,
        role: Role.STUDENT,
      },
    }),
  ]);

  const topic1 = await prisma.topic.create({
    data: {
      title: "O‘zgaruvchilar va ma’lumot turlari",
      summary: "let, const, string, number, boolean — asosiy tushunchalar.",
      content:
        "Offline darsda o‘zgaruvchilar bilan tanishdik. Shu yerda qisqa eslatma va misollar.\n\n1. const — o‘zgarmas qiymat\n2. let — keyinroq o‘zgartirish mumkin\n3. Turlar: string, number, boolean, null\n\nMisollarni qayta yozib ko‘ring. Keyin topshiriqni bajaring.",
      resourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types",
      authorId: teacher.id,
    },
  });

  const topic2 = await prisma.topic.create({
    data: {
      title: "Funksiyalar",
      summary: "Funksiya e’lon qilish, parametrlar va return.",
      content:
        "Funksiya — takrorlanadigan kodni bir joyga yig‘ish.\n\nfunction salom(ism) {\n  return \"Salom, \" + ism;\n}\n\nArrow function ham bor: const qo‘sh = (a, b) => a + b;\n\nOffline darsdagi mashqlarni shu yerda mustahkamlang.",
      resourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
      authorId: teacher.id,
    },
  });

  const assignment1 = await prisma.assignment.create({
    data: {
      title: "3 ta o‘zgaruvchi",
      description:
        "Ism (string), yosh (number) va talaba_mi (boolean) o‘zgaruvchilarini yarating. Konsolga chiqarib, kodni shu yerga joylang.",
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      topicId: topic1.id,
      authorId: teacher.id,
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: "kalkulyator funksiyasi",
      description:
        "Ikki sonni qo‘shadigan funksiya yozing. Kamida bitta misol bilan chaqiring. Kodni shu yerga yuboring.",
      dueAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      topicId: topic2.id,
      authorId: teacher.id,
    },
  });

  for (const student of students) {
    await prisma.notification.createMany({
      data: [
        {
          title: "Yangi mavzu",
          body: `"${topic1.title}" mavzusi qo‘shildi.`,
          href: `/student/topics/${topic1.id}`,
          userId: student.id,
        },
        {
          title: "Yangi mavzu",
          body: `"${topic2.title}" mavzusi qo‘shildi.`,
          href: `/student/topics/${topic2.id}`,
          userId: student.id,
        },
        {
          title: "Yangi topshiriq",
          body: `"${assignment1.title}" topshirig‘i berildi.`,
          href: `/student/assignments/${assignment1.id}`,
          userId: student.id,
        },
        {
          title: "Yangi topshiriq",
          body: `"${assignment2.title}" topshirig‘i berildi.`,
          href: `/student/assignments/${assignment2.id}`,
          userId: student.id,
        },
      ],
    });
  }

  console.log("Seed tayyor.");
  console.log("O‘qituvchi: oqituvchi@kurs.uz / kurs1234");
  console.log("O‘quvchi: jasur@kurs.uz / kurs1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
