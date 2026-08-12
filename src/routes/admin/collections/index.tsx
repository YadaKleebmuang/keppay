import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/fundflow/app-shell";
import { CollectionStatusBadge } from "@/components/fundflow/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { collections, formatTHB, obligationViewsForCollection } from "@/lib/fundflow-data";

export const Route = createFileRoute("/admin/collections/")({
  head: () => ({
    meta: [
      { title: "รายการเก็บเงิน — FundFlow" },
      {
        name: "description",
        content: "สร้างและจัดการรายการเก็บเงิน กำหนดสมาชิกและยอดที่แต่ละคนต้องชำระ",
      },
      { property: "og:title", content: "รายการเก็บเงิน — FundFlow" },
      { property: "og:description", content: "จัดการรายการเก็บเงินของกลุ่มและยอดต่อสมาชิก" },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  return (
    <AppShell variant="admin">
      <PageHeader
        title="รายการเก็บเงิน"
        description="ฉบับร่าง → เปิดรับชำระ → ปิดรับชำระ → เก็บเป็นประวัติ"
        action={
          <Button>
            <Plus className="size-4" />
            สร้างรายการใหม่
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {collections.map((c) => {
          const views = obligationViewsForCollection(c.id);
          const required = views.reduce((s, v) => s + v.obligation.requiredAmount, 0);
          const approved = views.reduce((s, v) => s + v.approved, 0);
          const percent = required ? Math.round((approved / required) * 100) : 0;

          return (
            <Link
              key={c.id}
              to="/admin/collections/$collectionId"
              params={{ collectionId: c.id }}
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
