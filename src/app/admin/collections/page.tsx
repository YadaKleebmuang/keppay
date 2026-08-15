import Link from "next/link";
import { AppShell, PageHeader } from "@/components/fundflow/app-shell";
import { CollectionStatusBadge } from "@/components/fundflow/status-badge";
import { Progress } from "@/components/ui/progress";
import { formatTHB } from "@/lib/fundflow-data";
import { getAdminData } from "@/lib/fundflow-repository";
import { createCollection } from "./actions";
import { CreateCollectionForm } from "./create-form";

export default async function CollectionsPage() {
  const data = await getAdminData();

  return (
    <AppShell variant="admin" profile={data.profile}>
      <PageHeader
        title="รายการเก็บเงิน"
        description="ฉบับร่าง → เปิดรับชำระ → ปิดรับชำระ → เก็บเป็นประวัติ"
      />

      <CreateCollectionForm profiles={data.profiles} createCollection={createCollection} />

      <div className="grid gap-4 md:grid-cols-2">
        {data.collections.map((c) => {
          const views = data.views.filter((view) => view.collection.id === c.id);
          const required = views.reduce((s, v) => s + v.obligation.requiredAmount, 0);
          const approved = views.reduce((s, v) => s + v.approved, 0);
          const percent = required ? Math.round((approved / required) * 100) : 0;

          return (
            <Link
              key={c.id}
              href={`/admin/collections/${c.id}`}
              className="rounded-xl border bg-card p-5 shadow-card transition-colors hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">{c.title}</h2>
                <CollectionStatusBadge status={c.status} />
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{c.description}</p>

              <div className="mt-4">
                <Progress value={percent} className="h-2" />
                <div className="text-numeric mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>สมาชิก {views.length} คน</span>
                  <span>ต้องเก็บ ฿{formatTHB(required)}</span>
                  <span className="text-success">เก็บได้ ฿{formatTHB(approved)}</span>
                  <span>{percent}%</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
