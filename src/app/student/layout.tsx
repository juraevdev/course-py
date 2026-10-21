import { AppNav } from "@/components/nav";
import { Shell } from "@/components/ui";
import { requirePageUser } from "@/lib/guard";
import { Role } from "@prisma/client";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageUser(Role.STUDENT);

  return (
    <Shell
      brand="Kurs"
      nav={
        <AppNav
          name={user.name}
          links={[
            { href: "/student", label: "Bosh sahifa" },
            { href: "/student/topics", label: "Mavzular" },
            { href: "/student/assignments", label: "Topshiriqlar" },
            { href: "/student/leaderboard", label: "Reyting" },
            { href: "/student/feedback", label: "Izohlar" },
            { href: "/student/notes", label: "Eslatmalar" },
            { href: "/student/notifications", label: "Bildirishnomalar" },
            { href: "/student/settings", label: "Sozlamalar" },
          ]}
        />
      }
    >
      {children}
    </Shell>
  );
}
