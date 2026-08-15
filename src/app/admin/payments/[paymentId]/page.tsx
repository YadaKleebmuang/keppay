import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Fingerprint } from "lucide-react";
import { AppShell, PageHeader } from "@/components/fundflow/app-shell";
import { FinancialStatusBadge, PaymentStatusBadge } from "@/components/fundflow/status-badge";
import { formatTHB } from "@/lib/fundflow-data";
import { getAdminData } from "@/lib/fundflow-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { approvePayment, rejectPayment } from "../actions";
import { PaymentReviewForm } from "./review-form";

export default async function PaymentReview({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const data = await getAdminData();
  const payment = data.payments.find((payment) => payment.id === paymentId);
  if (!payment) notFound();

  const view = data.views.find((view) => view.obligation.id === payment.obligationId);
  if (!view) notFound();

  let slipUrl: string | null = null;
  if (isSupabaseConfigured() && payment.slipPath) {
    const supabase = await createSupabaseServerClient();
    const { data: signed } = await supabase.storage
      .from("slips")
      .createSignedUrl(payment.slipPath, 60 * 5);
    slipUrl = signed?.signedUrl ?? null;
  }

  return (
    <AppShell variant="admin" profile={data.profile}>
      <Link
        href="/admin/payments"
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
          <div className="mt-3 flex flex-col items-center justify-center overflow-hidden rounded-lg border bg-secondary/10 text-center">
            {slipUrl ? (
              <img src={slipUrl} alt="สลิปการโอน" className="w-full h-auto max-h-[420px] object-contain" />
            ) : (
              <div className="p-6">
                <p className="text-sm font-medium text-foreground">ไม่พบ preview สลิป</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  หากเป็นข้อมูลตัวอย่างหรือไฟล์หมดอายุ ให้กลับไปส่งสลิปใหม่
                </p>
              </div>
            )}
          </div>
          <p className="text-numeric mt-3 flex items-start gap-1.5 text-xs text-muted-foreground break-all">
            <Fingerprint className="size-3.5 mt-0.5 shrink-0" />
            <span>SHA-256 {payment.slipHash}</span>
          </p>
        </section>

        <div className="space-y-5">
          <section className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">บริบททางการเงิน</h2>
              <FinancialStatusBadge status={view.status} />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="ยอดที่สมาชิกกรอก" value={`฿${formatTHB(payment.amountEntered)}`} />
              <Row label="ยอดที่ต้องชำระ" value={`฿${formatTHB(view.obligation.requiredAmount)}`} />
              <Row label="อนุมัติแล้วก่อนหน้านี้" value={`฿${formatTHB(view.approved)}`} />
              <Row label="รอตรวจสอบทั้งหมด" value={`฿${formatTHB(view.pending)}`} />
              <div className="border-t pt-2">
                <Row label="คงเหลือปัจจุบัน" value={`฿${formatTHB(view.remaining)}`} strong />
              </div>
            </dl>
          </section>

          {payment.status === "PENDING" ? (
            <PaymentReviewForm
              paymentId={payment.id}
              amountEntered={payment.amountEntered}
              approvePayment={approvePayment}
              rejectPayment={rejectPayment}
            />
          ) : (
            <section className="rounded-xl border bg-card p-5 shadow-card">
              <h2 className="text-sm font-semibold text-foreground">ผลการตรวจสอบก่อนหน้า</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <Row label="ตรวจเมื่อ" value={payment.reviewedAt ?? "—"} />
                <Row
                  label="ยอดที่อนุมัติ"
                  value={
                    payment.approvedAmount !== undefined
                      ? `฿${formatTHB(payment.approvedAmount)}`
                      : "—"
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
