import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ImageUp,
  Info,
  QrCode,
  ScanText,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/fundflow/app-shell";
import { FinancialStatusBadge, StatusBadge } from "@/components/fundflow/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildObligationView, formatTHB, obligationById } from "@/lib/fundflow-data";

export const Route = createFileRoute("/pay/$obligationId")({
  head: () => ({
    meta: [
      { title: "ส่งสลิปการโอน — keppay" },
      {
        name: "description",
        content: "อัปโหลดสลิปการโอน ระบบจะบีบอัดรูปและช่วยอ่านยอดด้วย OCR และ QR ก่อนส่งให้ผู้ดูแลตรวจ",
      },
      { property: "og:title", content: "ส่งสลิปการโอน — keppay" },
      { property: "og:description", content: "อัปโหลดหลักฐานการโอนเงินสำหรับรายการเก็บเงินของคุณ" },
    ],
  }),
  loader: ({ params }) => {
    const obligation = obligationById(params.obligationId);
    if (!obligation) throw notFound();
    return { obligationId: obligation.id };
  },
  component: PayPage,
});

const steps = ["ตรวจสอบไฟล์", "ย่อขนาด", "บีบอัด", "แปลงเป็น WebP", "คำนวณ Hash"];

function PayPage() {
  const { obligationId } = Route.useLoaderData();
  const view = buildObligationView(obligationById(obligationId)!);

  const [hasSlip, setHasSlip] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [amount, setAmount] = useState(String(view.remaining));

  const ocrAmount = 1180;
  const mismatch = scanned && Number(amount) !== ocrAmount;

  return (
    <AppShell variant="user">
      <Link
        to="/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        กลับไปรายการของฉัน
      </Link>

      <PageHeader
        title="ส่งสลิปการโอน"
        description={`${view.collection.title} — โอนเงินผ่านแอปธนาคารตามปกติ แล้วอัปโหลดสลิปที่นี่`}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-base font-semibold text-foreground">1. อัปโหลดสลิป</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              รองรับ JPEG, PNG และ WebP ระบบจะบีบอัดให้เหลือประมาณ 200–500 KB
              โดยยังคงความชัดของตัวเลขและ QR
            </p>

            <button
              type="button"
              onClick={() => {
                setHasSlip(true);
                setScanned(false);
                toast.success("บีบอัดรูปสลิปแล้ว (จำลอง) — 412 KB");
              }}
              className="mt-4 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/50 px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-secondary"
            >
              <ImageUp className="size-6 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {hasSlip ? "เลือกไฟล์ใหม่" : "เลือกรูปสลิปจากเครื่อง"}
              </span>
              <span className="text-xs text-muted-foreground">แตะเพื่อเลือกไฟล์ (ตัวอย่าง UI)</span>
            </button>

            {hasSlip ? (
              <div className="mt-4 rounded-lg border bg-secondary/40 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {steps.map((s) => (
                    <StatusBadge key={s} tone="success">
                      {s}
                    </StatusBadge>
                  ))}
                </div>
                <p className="text-numeric mt-3 text-xs text-muted-foreground">
                  slip-2026-03-02.webp · 412 KB · SHA-256 a71f0c…9d42
                </p>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-base font-semibold text-foreground">2. ช่วยอ่านข้อมูลจากสลิป</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              OCR และ QR เป็นเพียงตัวช่วยตรวจสอบ ไม่ใช้อนุมัติการชำระเงินโดยอัตโนมัติ
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={!hasSlip}
                onClick={() => {
                  setScanned(true);
                  toast.info("อ่านสลิปแล้ว: พบยอด 1,180.00 บาท และ QR 1 รายการ");
                }}
              >
                <ScanText className="size-4" />
                สแกนช่วยอ่าน
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setScanned(false);
                  toast("ข้ามการสแกน — กรอกยอดเงินเองได้เลย");
                }}
              >
                ข้ามและกรอกเอง
              </Button>
            </div>

            {scanned ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-secondary/40 p-3">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ScanText className="size-3.5" /> ยอดที่ OCR อ่านได้
                  </p>
                  <p className="text-numeric mt-1 text-lg font-semibold">฿{formatTHB(ocrAmount)}</p>
                </div>
                <div className="rounded-lg border bg-secondary/40 p-3">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <QrCode className="size-3.5" /> QR Code
                  </p>
                  <p className="mt-1 text-sm font-medium">พบ QR — เก็บเฉพาะ Hash</p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-base font-semibold text-foreground">3. ยืนยันยอดที่โอน</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="amount">จำนวนเงินที่โอน (บาท)</Label>
                <Input
                  id="amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-numeric mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="note">หมายเหตุถึงผู้ดูแล (ถ้ามี)</Label>
                <Textarea id="note" rows={3} className="mt-1.5" placeholder="เช่น โอนแยก 2 ครั้ง" />
              </div>
            </div>

            {mismatch ? (
              <p className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                ยอดที่กรอกไม่ตรงกับยอดที่ OCR อ่านได้ ({formatTHB(ocrAmount)})
                ผู้ดูแลจะเห็นความต่างนี้ตอนตรวจสอบ
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                disabled={!hasSlip || !amount}
                onClick={() => toast.success("ส่งสลิปแล้ว — สถานะ: รอตรวจสอบ")}
              >
                <Check className="size-4" />
                ส่งให้ผู้ดูแลตรวจสอบ
              </Button>
              <p className="text-xs text-muted-foreground">
                ยอดคงเหลือจะยังไม่ลดลงจนกว่าผู้ดูแลจะอนุมัติ
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">สรุปยอดรายการนี้</h2>
              <FinancialStatusBadge status={view.status} />
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="ยอดที่ต้องชำระ" value={`฿${formatTHB(view.obligation.requiredAmount)}`} />
              <Row label="อนุมัติแล้ว" value={`฿${formatTHB(view.approved)}`} />
              <Row label="รอตรวจสอบ" value={`฿${formatTHB(view.pending)}`} />
              <div className="border-t pt-2.5">
                <Row label="คงเหลือ" value={`฿${formatTHB(view.remaining)}`} strong />
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <ShieldCheck className="size-4" />
              สลิปของคุณเป็นข้อมูลส่วนตัว
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              ไฟล์สลิปถูกเก็บแบบ Private มีเพียงคุณและผู้ดูแลที่ตรวจสอบรายการนี้ที่เปิดดูได้
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Info className="size-4 text-muted-foreground" />
              จ่ายหลายครั้งได้
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              หนึ่งรายการสามารถส่งสลิปได้หลายใบ เช่น 1,200 + 800 + 1,200 จนครบยอด
            </p>
          </div>
        </aside>
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
