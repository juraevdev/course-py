import { AppNav } from "@/components/nav";
import { Shell } from "@/components/ui";
import { requirePageUser } from "@/lib/guard";
import { Role } from "@prisma/client";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageUser(Role.TEACHER);

  return (
    <Shell
      brand="Kurs"
      nav={
        <AppNav
          name={user.name}
          links={[
            { href: "/teacher", label: "Javoblar" },
            { href: "/teacher/topics", label: "Mavzular" },
            { href: "/teacher/assignments", label: "Topshiriqlar" },
          ]}
          moreLinks={[
            { href: "/teacher/submissions", label: "Barcha javoblar" },
            { href: "/teacher/cohorts", label: "Guruhlar" },
            { href: "/teacher/leaderboard", label: "Reyting" },
            { href: "/teacher/students", label: "O‘quvchilar" },
            { href: "/teacher/notifications", label: "Bildirishnomalar" },
          ]}
        />
      }
    >
      {children}
    </Shell>
  );
}
