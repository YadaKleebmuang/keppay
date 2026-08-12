import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppShell, PageHeader } from "@/components/fundflow/app-shell";
import { PaymentStatusBadge } from "@/components/fundflow/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTHB, type Payment, type PaymentStatus } from "@/lib/fundflow-data";
import { getAdminData, type AdminData } from "@/lib/fundflow-repository";

const tabs: { value: PaymentStatus | "ALL"; label: string }[] = [
  { value: "PENDING", label: "รอตรวจสอบ" },
  { value: "APPROVED", label: "อนุมัติแล้ว" },
  { value: "REJECTED", label: "ถูกปฏิเสธ" },
  { value: "ALL", label: "ทั้งหมด" },
];

export default async function PaymentsPage() {
  const data = await getAdminData();

  return (
    <AppShell variant="admin" profile={data.profile}>
      <PageHeader
        title="ตรวจสอบสลิป"
        description="คิวสลิปที่สมาชิกส่งเข้ามา ผู้ดูแลต้องตรวจรูปสลิปและยืนยันยอดก่อนอนุมัติ"
      />

      <Tabs defaultValue="PENDING">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => {
          const list =
            t.value === "ALL" ? data.payments : data.payments.filter((p) => p.status === t.value);
          return (
            <TabsContent key={t.value} value={t.value} className="mt-4 space-y-2.5">
              {list.length === 0 ? (
                <p className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
                  ไม่มีรายการในสถานะนี้
                </p>
              ) : (
                list.map((p) => <PaymentRow key={p.id} payment={p} data={data} />)
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </AppShell>
  );
}

function PaymentRow({ payment, data }: { payment: Payment; data: AdminData }) {
  const view = data.views.find((view) => view.obligation.id === payment.obligationId);
  if (!view) return null;

  return (
    <Link
      href={`/admin/payments/${payment.id}`}
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card p-4 shadow-card transition-colors hover:border-primary/30"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
        {view.member.initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{view.member.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {view.collection.title} · {payment.submittedAt}
        </span>
      </span>
      <span className="text-right">
        <span className="text-numeric block text-sm font-semibold text-foreground">
          ฿{formatTHB(payment.amountEntered)}
        </span>
        <span className="block text-xs text-muted-foreground">ยอดที่สมาชิกกรอก</span>
      </span>
      <PaymentStatusBadge status={payment.status} />
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
