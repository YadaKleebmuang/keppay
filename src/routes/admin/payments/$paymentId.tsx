import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Fingerprint, QrCode, ScanText, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/fundflow/app-shell";
import { FinancialStatusBadge, PaymentStatusBadge } from "@/components/fundflow/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildObligationView, formatTHB, obligationById, paymentById } from "@/lib/fundflow-data";

export const Route = createFileRoute("/admin/payments/$paymentId")({
  head: () => ({
    meta: [
      { title: "ตรวจสลิปการชำระ — keppay" },
      {
        name: "description",
        content: "ดูสลิป ยอดที่สมาชิกกรอก ข้อมูล OCR/QR และประวัติการชำระ ก่อนอนุมัติหรือปฏิเสธ",
      },
      { property: "og:title", content: "ตรวจสลิปการชำระ — keppay" },
      { property: "og:description", content: "อนุมัติยอดที่ตรวจสอบแล้วหรือปฏิเสธพร้อมเหตุผล" },
    ],
  }),
  loader: ({ params }) => {
    const payment = paymentById(params.paymentId);
    if (!payment) throw notFound();
    return { paymentId: payment.id };
  },
  component: PaymentReview,
});

function PaymentReview() {
  const { paymentId } = Route.useLoaderData();
  const payment = paymentById(paymentId)!;
  const view = buildObligationView(obligationById(payment.obligationId)!);
  const [approvedAmount, setApprovedAmount] = useState(
    String(payment.approvedAmount ?? payment.amountEntered),
  );
  const mismatch = payment.ocrAmount !== undefined && payment.ocrAmount !== payment.amountEntered;

  return (
    <AppShell variant="admin">
      <Link
        to="/admin/payments"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        กลับไปคิวตรวจสลิป
      </Link>

      <PageHeader
        title={`สลิปของ ${view.member.name}`}
        description={`${view.collection.title} · ส่งเมื่อ ${payment.submittedAt}`}
        action={<PaymentStatusBadge status={payment.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-xl border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground">หลักฐานการโอน</h2>
          <div className="mt-3 flex aspect-3/4 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-secondary/50 text-center">
            <p className="text-sm font-medium text-foreground">สลิป {payment.bank}</p>
            <p className="text-numeric text-2xl font-semibold text-foreground">
              ฿{formatTHB(payment.amountEntered)}
            </p>
            <p className="max-w-[16rem] text-xs text-muted-foreground">
              ตัวอย่างพื้นที่แสดงรูปสลิป ของจริงจะโหลดจากที่เก็บไฟล์แบบ Private ผ่านลิงก์ชั่วคราว
            </p>
          </div>
          <p className="text-numeric mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Fingerprint className="size-3.5" />
            SHA-256 {payment.slipHash}
          </p>
        </section>

        <div className="space-y-5">
          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold text-foreground">ข้อมูลช่วยตรวจสอบ</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Info
                icon={<ScanText className="size-3.5" />}
                label="ยอดจาก OCR"
                value={payment.ocrAmount !== undefined ? `฿${formatTHB(payment.ocrAmount)}` : "ไม่พบ"}
              />
              <Info
                icon={<QrCode className="size-3.5" />}
                label="QR Code"
                value={payment.qrDetected ? "พบ (เก็บเฉพาะ Hash)" : "ไม่พบ"}
              />
            </div>
            {mismatch ? (
              <p className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                ยอดที่สมาชิกกรอกไม่ตรงกับที่ OCR อ่านได้ โปรดตรวจสลิปด้วยตาก่อนอนุมัติ
              </p>
            ) : null}
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">บริบททางการเงิน</h2>
              <FinancialStatusBadge status={view.status} />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="ยอดที่ต้องชำระ" value={`฿${formatTHB(view.obligation.requiredAmount)}`} />
              <Row label="อนุมัติแล้วก่อนหน้านี้" value={`฿${formatTHB(view.approved)}`} />
              <Row label="รอตรวจสอบทั้งหมด" value={`฿${formatTHB(view.pending)}`} />
              <div className="border-t pt-2">
                <Row label="คงเหลือปัจจุบัน" value={`฿${formatTHB(view.remaining)}`} strong />
              </div>
            </dl>
          </section>

          {payment.status === "PENDING" ? (
            <section className="rounded-xl border bg-card p-5 shadow-card">
              <h2 className="text-sm font-semibold text-foreground">ผลการตรวจสอบ</h2>

              <div className="mt-3">
                <Label htmlFor="approved">ยอดที่อนุมัติ (บาท)</Label>
                <Input
                  id="approved"
                  inputMode="decimal"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  className="text-numeric mt-1.5"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  ยอดนี้คือค่าที่ใช้คำนวณสถานะการเงินจริง
                </p>
              </div>

              <div className="mt-4">
                <Label htmlFor="reason">เหตุผล (กรณีปฏิเสธ)</Label>
                <Textarea
                  id="reason"
                  rows={3}
                  className="mt-1.5"
                  placeholder="เช่น สลิปไม่ชัด ยอดไม่ตรง เป็นสลิปซ้ำ"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    toast.success(`อนุมัติแล้ว ฿${formatTHB(Number(approvedAmount) || 0)} (จำลอง)`)
                  }
                >
                  <Check className="size-4" />
                  อนุมัติ
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => toast("ปฏิเสธสลิปแล้ว (จำลอง)")}
                >
                  <X className="size-4" />
                  ปฏิเสธ
                </Button>
              </div>
            </section>
          ) : (
            <section className="rounded-xl border bg-card p-5 shadow-card">
              <h2 className="text-sm font-semibold text-foreground">ผลการตรวจสอบก่อนหน้า</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <Row label="ตรวจเมื่อ" value={payment.reviewedAt ?? "—"} />
                <Row
                  label="ยอดที่อนุมัติ"
                  value={
                    payment.approvedAmount !== undefined ? `฿${formatTHB(payment.approvedAmount)}` : "—"
                  }
                />
              </dl>
              {payment.rejectReason ? (
                <p className="mt-3 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
                  {payment.rejectReason}
                </p>
              ) : null}
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-secondary/40 p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="text-numeric mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={
          strong
            ? "text-numeric text-base font-semibold text-foreground"
            : "text-numeric font-medium text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}
