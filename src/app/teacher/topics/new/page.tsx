import { CreateTopicForm } from "@/components/forms";
import { PageIntro, Panel } from "@/components/ui";

export default function NewTopicPage() {
  return (
    <>
      <PageIntro
        eyebrow="Yangi material"
        title="Mavzu joylash"
        description="Offline darsdagi mavzuni kod misollari va hujjatlar bilan qo‘llab-quvvatlang. Joylaganingizdan so‘ng o‘quvchilarga bildirishnoma ketadi."
      />
      <Panel className="max-w-2xl">
        <CreateTopicForm />
      </Panel>
    </>
  );
}
