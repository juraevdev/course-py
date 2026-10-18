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
            { href: "/teacher", label: "Bosh sahifa" },
            { href: "/teacher/students", label: "O‘quvchilar" },
            { href: "/teacher/topics/new", label: "Mavzu" },
            { href: "/teacher/assignments/new", label: "Topshiriq" },
            { href: "/teacher/notifications", label: "Bildirishnomalar" },
          ]}
        />
      }
    >
      {children}
    </Shell>
  );
}
