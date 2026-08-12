import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, QrCode, ScanText } from "lucide-react";
import { AppShell, PageHeader } from "@/components/fundflow/app-shell";
import { PaymentStatusBadge, StatusBadge } from "@/components/fundflow/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildObligationView,
  formatTHB,
  obligationById,
  payments,
  type Payment,
  type PaymentStatus,
} from "@/lib/fundflow-data";

export const Route = createFileRoute("/admin/payments/")({
  head: () => ({
    meta: [
      { title: "ตรวจสอบสลิป — keppay" },
      {
        name: "description",
        content: "คิวสลิปที่รอตรวจสอบ พร้อมยอดที่สมาชิกกรอก ข้อมูลช่วยอ่านจาก OCR และ QR",
      },
      { property: "og:title", content: "ตรวจสอบสลิป — keppay" },
      { property: "og:description", content: "อนุมัติหรือปฏิเสธสลิปการโอนของสมาชิกอย่างเป็นระบบ" },
    ],
  }),
  component: PaymentsPage,
});

const tabs: { value: PaymentStatus | "ALL"; label: string }[] = [
  { value: "PENDING", label: "รอตรวจสอบ" },
  { value: "APPROVED", label: "อนุมัติแล้ว" },
  { value: "REJECTED", label: "ถูกปฏิเสธ" },
  { value: "ALL", label: "ทั้งหมด" },
];

function PaymentsPage() {
  return (
    <AppShell variant="admin">
      <PageHeader
        title="ตรวจสอบสลิป"
        description="ข้อมูลจาก OCR และ QR เป็นเพียงตัวช่วย การอนุมัติต้องยืนยันด้วยผู้ดูแลเสมอ"
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
          const list = t.value === "ALL" ? payments : payments.filter((p) => p.status === t.value);
          return (
            <TabsContent key={t.value} value={t.value} className="mt-4 space-y-2.5">
              {list.length === 0 ? (
                <p className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
                  ไม่มีรายการในสถานะนี้
                </p>
              ) : (
                list.map((p) => <PaymentRow key={p.id} payment={p} />)
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </AppShell>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  const view = buildObligationView(obligationById(payment.obligationId)!);
  const mismatch = payment.ocrAmount !== undefined && payment.ocrAmount !== payment.amountEntered;

  return (
    <Link
      to="/admin/payments/$paymentId"
      params={{ paymentId: payment.id }}
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card p-4 shadow-card transition-colors hover:border-primary/30"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
        {view.member.initials}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{view.member.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {view.collection.title} · {payment.bank} · {payment.submittedAt}
        </span>
      </span>

      <span className="flex flex-wrap items-center gap-2">
        {payment.ocrAmount !== undefined ? (
          <StatusBadge tone={mismatch ? "warning" : "neutral"}>
            <ScanText className="size-3" />
            OCR ฿{formatTHB(payment.ocrAmount)}
          </StatusBadge>
        ) : null}
        {payment.qrDetected ? (
          <StatusBadge tone="neutral">
            <QrCode className="size-3" />
            พบ QR
          </StatusBadge>
        ) : null}
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
