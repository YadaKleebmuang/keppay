import Link from "next/link";
import { ArrowUpRight, Receipt } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/fundflow/app-shell";
import {
  CollectionStatusBadge,
  FinancialStatusBadge,
  PaymentStatusBadge,
} from "@/components/fundflow/status-badge";
import { Progress } from "@/components/ui/progress";
import { formatTHB } from "@/lib/fundflow-data";
import { getDashboardData } from "@/lib/fundflow-repository";

export default async function Dashboard() {
  const { profile, views, isDemo } = await getDashboardData();
  const required = views.reduce((s, v) => s + v.obligation.requiredAmount, 0);
  const approved = views.reduce((s, v) => s + v.approved, 0);
  const pending = views.reduce((s, v) => s + v.pending, 0);
  const remaining = views.reduce((s, v) => s + v.remaining, 0);

  return (
    <AppShell variant="user" profile={profile}>
      <PageHeader
        title={`สวัสดี ${profile.name.split(" ")[0]}`}
        description={
          isDemo
            ? "โหมดตัวอย่าง: ยังไม่ได้ตั้งค่า Supabase env จึงใช้ข้อมูลจำลอง"
            : "นี่คือรายการที่คุณได้รับมอบหมายให้ชำระ ยอดคงเหลือคิดจากสลิปที่ผู้ดูแลอนุมัติแล้วเท่านั้น"
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="ยอดที่ต้องชำระ" value={`฿${formatTHB(required)}`} />
        <StatCard
          label="อนุมัติแล้ว"
          value={`฿${formatTHB(approved)}`}
          tone="success"
          hint="ผู้ดูแลตรวจสลิปแล้ว"
        />
        <StatCard
          label="รอตรวจสอบ"
          value={`฿${formatTHB(pending)}`}
          tone="warning"
          hint="ยังไม่ลดยอดคงเหลือ"
        />
        <StatCard label="ยอดคงเหลือ" value={`฿${formatTHB(remaining)}`} tone="primary" />
      </div>

      <h2 className="mt-10 mb-4 text-lg font-semibold text-foreground">รายการของฉัน</h2>

      <div className="space-y-4">
        {views.map((v) => {
          const percent = Math.min(
            Math.round((v.approved / v.obligation.requiredAmount) * 100),
            100,
          );
          return (
            <article key={v.obligation.id} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {v.collection.title}
                    </h3>
                    <CollectionStatusBadge status={v.collection.status} />
                    <FinancialStatusBadge status={v.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{v.collection.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">ยอดของคุณ</p>
                  <p className="text-numeric text-xl font-semibold text-foreground">
                    ฿{formatTHB(v.obligation.requiredAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Progress value={percent} className="h-2" />
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    อนุมัติแล้ว{" "}
                    <strong className="text-numeric text-success">฿{formatTHB(v.approved)}</strong>
                  </span>
                  <span>
                    รอตรวจสอบ{" "}
                    <strong className="text-numeric text-warning-foreground">
                      ฿{formatTHB(v.pending)}
                    </strong>
                  </span>
                  <span>
                    คงเหลือ{" "}
                    <strong className="text-numeric text-foreground">
                      ฿{formatTHB(v.remaining)}
                    </strong>
                  </span>
                  {v.collection.dueDate ? <span>กำหนดชำระ {v.collection.dueDate}</span> : null}
                </div>
              </div>

              {v.payments.length > 0 ? (
                <ul className="mt-4 divide-y border-t pt-2">
                  {v.payments.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                      <Receipt className="size-4 text-muted-foreground" />
                      <span className="text-numeric font-medium">
                        ฿{formatTHB(p.amountEntered)}
                      </span>
                      <span className="text-muted-foreground">{p.bank}</span>
                      <span className="text-xs text-muted-foreground">{p.submittedAt}</span>
                      <span className="ml-auto flex items-center gap-2">
                        {p.status === "APPROVED" && p.approvedAmount ? (
                          <span className="text-numeric text-xs text-muted-foreground">
                            อนุมัติ ฿{formatTHB(p.approvedAmount)}
                          </span>
                        ) : null}
                        <PaymentStatusBadge status={p.status} />
                      </span>
                      {p.rejectReason ? (
                        <p className="w-full text-xs text-destructive">
                          เหตุผลที่ปฏิเสธ: {p.rejectReason}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}

              {v.collection.status === "OPEN" ? (
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/pay/${v.obligation.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    ส่งสลิปการโอน
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              ) : (
                <p className="mt-4 text-xs text-muted-foreground">
                  รายการนี้ปิดรับการชำระแล้ว หากมียอดค้างโปรดติดต่อผู้ดูแล
                </p>
              )}
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
