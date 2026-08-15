"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PaymentReviewForm({
  paymentId,
  amountEntered,
  approvePayment,
  rejectPayment,
}: {
  paymentId: string;
  amountEntered: number;
  approvePayment: (formData: FormData) => Promise<void>;
  rejectPayment: (formData: FormData) => Promise<void>;
}) {
  const [isPending, setIsPending] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState(String(amountEntered));
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    setIsPending(true);

    const formData = new FormData();
    formData.append("paymentId", paymentId);
    formData.append("approvedAmount", approvedAmount);

    try {
      await approvePayment(formData);
      toast.success("อนุมัติรายการชำระเงินเรียบร้อย");
    } catch (err: any) {
      if (
        err?.message === "NEXT_REDIRECT" ||
        err?.digest?.includes("NEXT_REDIRECT") ||
        String(err).includes("NEXT_REDIRECT")
      ) {
        throw err;
      }
      toast.error(err.message || "เกิดข้อผิดพลาดในการอนุมัติ");
      setIsPending(false);
    }
  };

  const handleReject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    setIsPending(true);

    const formData = new FormData();
    formData.append("paymentId", paymentId);
    formData.append("rejectReason", rejectReason);

    try {
      await rejectPayment(formData);
      toast.success("ปฏิเสธรายการชำระเงินเรียบร้อย");
    } catch (err: any) {
      if (
        err?.message === "NEXT_REDIRECT" ||
        err?.digest?.includes("NEXT_REDIRECT") ||
        String(err).includes("NEXT_REDIRECT")
      ) {
        throw err;
      }
      toast.error(err.message || "เกิดข้อผิดพลาดในการปฏิเสธ");
      setIsPending(false);
    }
  };

  return (
    <section className="rounded-xl border bg-card p-5 shadow-card relative">
      <h2 className="text-sm font-semibold text-foreground">ผลการตรวจสอบ</h2>
      <div className="mt-3">
        <Label htmlFor="approved">ยอดที่อนุมัติ (บาท)</Label>
        <Input
          id="approved"
          name="approvedAmount"
          inputMode="decimal"
          value={approvedAmount}
          disabled={isPending}
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
          name="rejectReason"
          rows={3}
          value={rejectReason}
          disabled={isPending}
          onChange={(e) => setRejectReason(e.target.value)}
          className="mt-1.5"
          placeholder="เช่น สลิปไม่ชัด ยอดไม่ตรง เป็นสลิปซ้ำ"
        />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <form onSubmit={handleApprove} className="w-full">
          <Button disabled={isPending} type="submit" className="w-full">
            {isPending ? (
              <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
            ) : (
              <Check className="size-4" />
            )}
            อนุมัติ
          </Button>
        </form>
        <form onSubmit={handleReject} className="w-full">
          <Button disabled={isPending} variant="destructive" type="submit" className="w-full">
            {isPending ? (
              <div className="size-4 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent"></div>
            ) : (
              <X className="size-4" />
            )}
            ปฏิเสธ
          </Button>
        </form>
      </div>

      {/* หน้าจอ Loading Overlay ระหว่างประมวลผลอนุมัติ/ปฏิเสธ */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md transition-opacity">
          <div className="flex flex-col items-center gap-5 text-center p-6 max-w-sm">
            <div className="relative size-24 animate-bounce">
              <img
                src="/Kep.png"
                alt="กำลังโหลด..."
                className="size-full object-contain"
              />
            </div>
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">กำลังบันทึกข้อมูล...</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ระบบกำลังอัปเดตสถานะหลักฐานชำระเงิน กรุณารอสักครู่ (ห้ามปิดหน้านี้)
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
