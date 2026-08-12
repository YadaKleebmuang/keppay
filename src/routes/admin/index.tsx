import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/fundflow/app-shell";
import { CollectionStatusBadge, PaymentStatusBadge } from "@/components/fundflow/status-badge";
import {
  adminTotals,
  buildObligationView,
  collections,
  formatTHB,
  obligationById,
  pendingPayments,
} from "@/lib/fundflow-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "ภาพรวมผู้ดูแล — FundFlow" },
      {
        name: "description",
        content: "ภาพรวมรายการเก็บเงิน จำนวนสมาชิก สลิปที่รอตรวจสอบ และยอดคงเหลือของกลุ่ม",
      },
      { property: "og:title", content: "ภาพรวมผู้ดูแล — FundFlow" },
      { property: "og:description", content: "ติดตามยอดเก็บเงินและสลิปที่รอตรวจในที่เดียว" },
    ],
  }),
  component: AdminHome,
});

function AdminHome() {
  const t = adminTotals();
  const queue = pendingPayments();

  return (
    <AppShell variant="admin">
      <PageHeader
        title="ภาพรวมการเก็บเงิน"
        description="ยอดทางการเงินทั้งหมดคำนวณจากสลิปที่อนุมัติแล้วเท่านั้น"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="รายการที่ใช้งาน" value={String(t.collections)} hint="ไม่รวมที่เก็บประวัติ" />
        <StatCard label="สมาชิก" value={String(t.members)} />
        <StatCard label="สลิปรอตรวจสอบ" value={String(t.pending)} tone="warning" />
        <StatCard label="ยอดที่ต้องเก็บ" value={`฿${formatTHB(t.required)}`} />
        <StatCard label="อนุมัติแล้ว" value={`฿${formatTHB(t.approved)}`} tone="success" />
        <StatCard label="ยอดคงเหลือ" value={`฿${formatTHB(t.remaining)}`} tone="primary" />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">คิวตรวจสลิป</h2>
            <Link
              to="/admin/payments"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              ดูทั้งหมด <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <ul className="space-y-2.5">
            {queue.map((p) => {
              const view = buildObligationView(obligationById(p.obligationId)!);
              return (
                <li key={p.id}>
                  <Link
                    to="/admin/payments/$paymentId"
                    params={{ paymentId: p.id }}
                    className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-card transition-colors hover:border-primary/30"
                  >
                    <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                      {view.member.initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {view.member.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {view.collection.title} · {p.submittedAt}
                      </span>
                    </span>
                    <span className="text-numeric ml-auto text-right text-sm font-semibold">
                      ฿{formatTHB(p.amountEntered)}
                    </span>
                    <PaymentStatusBadge status={p.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">รายการเก็บเงิน</h2>
            <Link
              to="/admin/collections"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              จัดการ <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <ul className="space-y-2.5">
            {collections.slice(0, 4).map((c) => (
              <li key={c.id}>
                <Link
                  to="/admin/collections/$collectionId"
                  params={{ collectionId: c.id }}
                  className="block rounded-xl border bg-card p-4 shadow-card transition-colors hover:border-primary/30"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{c.title}</span>
                    <CollectionStatusBadge status={c.status} />
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    สร้างเมื่อ {c.createdAt}
                    {c.dueDate ? ` · กำหนดชำระ ${c.dueDate}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
