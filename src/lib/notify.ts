import { prisma } from "./prisma";

type NotifyInput = {
  userId: string;
  title: string;
  body: string;
  href?: string;
};

/** Faqat in-app bildirishnoma (email yo‘q). */
export async function notifyUser(input: NotifyInput) {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      body: input.body,
      href: input.href,
    },
  });
}

export async function notifyMany(
  userIds: string[],
  payload: Omit<NotifyInput, "userId">,
) {
  await Promise.all(userIds.map((userId) => notifyUser({ ...payload, userId })));
}
