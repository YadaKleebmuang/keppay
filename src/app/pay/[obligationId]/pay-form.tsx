"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, ImageUp, Info, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/fundflow/app-shell";
import { FinancialStatusBadge, StatusBadge } from "@/components/fundflow/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatTHB, type ObligationView, type Profile } from "@/lib/fundflow-data";
import { submitSlip } from "../actions";

const steps = ["ตรวจสอบไฟล์", "ย่อขนาด", "บีบอัด", "แปลงเป็น WebP", "คำนวณ Hash"];

export function PayForm({
  profile,
  view,
  isDemo,
}: {
  profile: Profile;
  view: ObligationView;
  isDemo: boolean;
}) {
  const [hasSlip, setHasSlip] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [amount, setAmount] = useState(String(view.remaining));

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <AppShell variant="user" profile={profile}>
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        กลับไปรายการของฉัน
      </Link>

      <PageHeader
        title="ส่งสลิปการโอน"
        description={
          isDemo
            ? `${view.collection.title} — โหมดตัวอย่าง`
            : `${view.collection.title} — โอนเงินผ่านแอปธนาคารตามปกติ แล้วอัปโหลดสลิปที่นี่`
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-base font-semibold text-foreground">1. อัปโหลดสลิป</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              รองรับ JPEG, PNG และ WebP ระบบจะบีบอัดให้เหลือประมาณ 200-500 KB
              โดยยังคงความชัดของตัวเลขและ QR
            </p>
            <label className="mt-4 flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/50 px-6 py-8 text-center transition-colors hover:border-primary/40 hover:bg-secondary">
              {previewUrls.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                  {previewUrls.map((url, idx) => (
                    <span key={url} className="relative block overflow-hidden rounded-lg border bg-card aspect-[3/4]">
                      <img
                        src={url}
                        alt={`ตัวอย่างสลิปที่ ${idx + 1}`}
                        className="h-full w-full object-contain"
                      />
                    </span>
                  ))}
                </div>
              ) : (
                <ImageUp className="size-6 text-primary" />
              )}
              <span className="text-sm font-medium text-foreground">
                {hasSlip ? "เลือกไฟล์ใหม่" : "เลือกรูปสลิปจากเครื่อง"}
              </span>
              <span className="text-xs text-muted-foreground max-w-md truncate">
                {fileNames.join(", ") || "รองรับ JPEG, PNG และ WebP (เลือกได้หลายไฟล์)"}
              </span>
              <input
                form="submit-slip-form"
                name="slip"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  const files = event.target.files ? Array.from(event.target.files) : [];
                  if (files.length > 0) {
                    setHasSlip(true);
                    previewUrls.forEach((url) => URL.revokeObjectURL(url));
                    const urls = files.map((file) => URL.createObjectURL(file));
                    setPreviewUrls(urls);
                    setFileNames(files.map((f) => f.name));
                    toast.success(`เลือกไฟล์สลิปแล้ว ${files.length} ใบ`);
                  }
                }}
              />
            </label>
            {hasSlip ? (
              <div className="mt-4 rounded-lg border bg-secondary/40 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {steps.map((step) => (
                    <StatusBadge key={step} tone="success">
                      {step}
                    </StatusBadge>
                  ))}
                </div>
                <p className="text-numeric mt-3 text-xs text-muted-foreground">
                  ไฟล์จะถูกอัปโหลดเข้า Supabase Storage bucket `slips`
                </p>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-base font-semibold text-foreground">2. ยืนยันยอดที่โอน</h2>
            <form id="submit-slip-form" action={submitSlip} className="mt-4 space-y-4">
              <input type="hidden" name="obligationId" value={view.obligation.id} />
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="amount">จำนวนเงินที่โอน (บาท)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-numeric mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="note">หมายเหตุถึงผู้ดูแล (ถ้ามี)</Label>
                  <Textarea
                    id="note"
                    name="note"
                    rows={3}
                    className="mt-1.5"
                    placeholder="เช่น โอนแยก 2 ครั้ง"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled={!hasSlip || !amount} type="submit">
                  <Check className="size-4" />
                  ส่งให้ผู้ดูแลตรวจสอบ
                </Button>
                <p className="text-xs text-muted-foreground">
                  ยอดคงเหลือจะยังไม่ลดลงจนกว่าผู้ดูแลจะอนุมัติ
                </p>
              </div>
            </form>
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
              <ShieldCheck className="size-4" /> สลิปของคุณเป็นข้อมูลส่วนตัว
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              ไฟล์สลิปถูกเก็บแบบ Private มีเพียงคุณและผู้ดูแลที่ตรวจสอบรายการนี้ที่เปิดดูได้
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Info className="size-4 text-muted-foreground" /> จ่ายหลายครั้งได้
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
