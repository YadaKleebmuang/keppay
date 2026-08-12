import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/fundflow/app-shell";
import { CollectionStatusBadge } from "@/components/fundflow/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { formatTHB } from "@/lib/fundflow-data";
import { getAdminData } from "@/lib/fundflow-repository";
import { createCollection } from "./actions";

export default async function CollectionsPage() {
  const data = await getAdminData();

  return (
    <AppShell variant="admin" profile={data.profile}>
      <PageHeader
        title="รายการเก็บเงิน"
        description="ฉบับร่าง → เปิดรับชำระ → ปิดรับชำระ → เก็บเป็นประวัติ"
      />

      <section className="mb-6 rounded-xl border bg-card p-5 shadow-card">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Plus className="size-4 text-primary" />
          สร้างรายการใหม่
        </h2>
        <form action={createCollection} className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="title">ชื่อรายการ</Label>
            <Input id="title" name="title" className="mt-1.5" placeholder="เช่น ค่าเสื้อทีม" />
          </div>
          <div>
            <Label htmlFor="amount">ยอดต่อคน (บาท)</Label>
            <Input
              id="amount"
              name="amount"
              inputMode="decimal"
              className="text-numeric mt-1.5"
              placeholder="450"
            />
          </div>
          <div>
            <Label htmlFor="dueDate">กำหนดชำระ</Label>
            <Input id="dueDate" name="dueDate" type="date" className="mt-1.5" />
          </div>
          <div className="lg:row-span-2">
            <Label>สมาชิกที่ต้องชำระ</Label>
            <div className="mt-1.5 max-h-44 space-y-2 overflow-y-auto rounded-lg border bg-secondary/30 p-3">
              {data.profiles.filter((profile) => profile.status === "ACTIVE").length === 0 ? (
                <p className="text-sm text-muted-foreground">ยังไม่มีสมาชิกที่ใช้งานได้</p>
              ) : (
                data.profiles
                  .filter((profile) => profile.status === "ACTIVE")
                  .map((profile) => (
                    <label key={profile.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="memberIds"
                        value={profile.id}
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
              className="mt-1.5"
              placeholder="รายละเอียดเพิ่มเติม"
            />
          </div>
          <div className="lg:col-span-2">
            <Button type="submit">
              <Plus className="size-4" />
              สร้างรายการใหม่
            </Button>
          </div>
        </form>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {data.collections.map((c) => {
          const views = data.views.filter((view) => view.collection.id === c.id);
          const required = views.reduce((s, v) => s + v.obligation.requiredAmount, 0);
          const approved = views.reduce((s, v) => s + v.approved, 0);
          const percent = required ? Math.round((approved / required) * 100) : 0;

          return (
            <Link
              key={c.id}
              href={`/admin/collections/${c.id}`}
              className="rounded-xl border bg-card p-5 shadow-card transition-colors hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">{c.title}</h2>
                <CollectionStatusBadge status={c.status} />
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{c.description}</p>

              <div className="mt-4">
                <Progress value={percent} className="h-2" />
                <div className="text-numeric mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>สมาชิก {views.length} คน</span>
                  <span>ต้องเก็บ ฿{formatTHB(required)}</span>
                  <span className="text-success">เก็บได้ ฿{formatTHB(approved)}</span>
                  <span>{percent}%</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
