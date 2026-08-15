"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Profile {
  id: string;
  name: string;
  email: string;
  status: string;
}

export function CreateCollectionForm({
  profiles,
  createCollection,
}: {
  profiles: Profile[];
  createCollection: (formData: FormData) => Promise<void>;
}) {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    setIsPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await createCollection(formData);
      toast.success("สร้างรายการเก็บเงินใหม่เรียบร้อย");
      form.reset();
    } catch (err: any) {
      if (
        err?.message === "NEXT_REDIRECT" ||
        err?.digest?.includes("NEXT_REDIRECT") ||
        String(err).includes("NEXT_REDIRECT")
      ) {
        throw err;
      }
      toast.error(err.message || "เกิดข้อผิดพลาดในการสร้างรายการ");
      setIsPending(false);
    }
  };

  const activeProfiles = profiles.filter((p) => p.status === "ACTIVE");

  return (
    <section className="mb-6 rounded-xl border bg-card p-5 shadow-card relative">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Plus className="size-4 text-primary" />
        สร้างรายการใหม่
      </h2>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="title">ชื่อรายการ</Label>
          <Input id="title" name="title" disabled={isPending} className="mt-1.5" placeholder="เช่น ค่าเสื้อทีม" required />
        </div>
        <div>
          <Label htmlFor="amount">ยอดต่อคน (บาท)</Label>
          <Input
            id="amount"
            name="amount"
            inputMode="decimal"
            disabled={isPending}
            className="text-numeric mt-1.5"
            placeholder="450"
            required
          />
        </div>
        <div>
          <Label htmlFor="dueDate">กำหนดชำระ</Label>
          <Input id="dueDate" name="dueDate" type="date" disabled={isPending} className="mt-1.5" required />
        </div>
        <div className="lg:row-span-2">
          <Label>สมาชิกที่ต้องชำระ</Label>
          <div className="mt-1.5 max-h-44 space-y-2 overflow-y-auto rounded-lg border bg-secondary/30 p-3">
            {activeProfiles.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่มีสมาชิกที่ใช้งานได้</p>
            ) : (
              activeProfiles.map((profile) => (
                <label key={profile.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="memberIds"
                    value={profile.id}
                    disabled={isPending}
                    className="size-4 rounded border-primary accent-primary"
                  />
                  <span>{profile.name}</span>
                  <span className="text-xs text-muted-foreground">{profile.email}</span>
                </label>
              ))
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="description">รายละเอียด</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            disabled={isPending}
            className="mt-1.5"
            placeholder="รายละเอียดเพิ่มเติม"
          />
        </div>
        <div className="lg:col-span-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
            ) : (
              <Plus className="size-4" />
            )}
            {isPending ? "กำลังสร้าง..." : "สร้างรายการใหม่"}
          </Button>
        </div>
      </form>

      {/* หน้าจอ Loading Overlay ระหว่างประมวลผล */}
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
                ระบบกำลังสร้างรายการเก็บเงินใหม่และส่งแจ้งเตือนสมาชิก
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
