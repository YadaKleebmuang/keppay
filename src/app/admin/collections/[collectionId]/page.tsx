import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save, Trash2, UserPlus } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/fundflow/app-shell";
import { CollectionStatusBadge, FinancialStatusBadge } from "@/components/fundflow/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatTHB } from "@/lib/fundflow-data";
import { getAdminData } from "@/lib/fundflow-repository";
import {
  addCollectionMember,
  deleteCollection,
  deleteCollectionMember,
  updateCollection,
  updateCollectionMember,
} from "../actions";

export default async function CollectionDetail({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  const data = await getAdminData();
  const collection = data.collections.find((collection) => collection.id === collectionId);
  if (!collection) notFound();

  const views = data.views.filter((view) => view.collection.id === collection.id);
  const memberIds = new Set(views.map((view) => view.member.id));
  const availableMembers = data.profiles.filter(
    (profile) => profile.status === "ACTIVE" && !memberIds.has(profile.id),
  );
  const required = views.reduce((sum, view) => sum + view.obligation.requiredAmount, 0);
  const approved = views.reduce((sum, view) => sum + view.approved, 0);
  const pending = views.reduce((sum, view) => sum + view.pending, 0);

  return (
    <AppShell variant="admin" profile={data.profile}>
      <Link
        href="/admin/collections"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        กลับไปรายการเก็บเงิน
      </Link>

      <PageHeader title={collection.title} description={collection.description} />

      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <CollectionStatusBadge status={collection.status} />
        <span>สร้างเมื่อ {collection.createdAt}</span>
        {collection.dueDate ? <span>กำหนดชำระ {collection.dueDate}</span> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="ยอดที่ต้องเก็บ" value={`฿${formatTHB(required)}`} />
        <StatCard label="อนุมัติแล้ว" value={`฿${formatTHB(approved)}`} tone="success" />
        <StatCard label="รอตรวจสอบ" value={`฿${formatTHB(pending)}`} tone="warning" />
      </div>

      <section className="mt-8 rounded-xl border bg-card p-5 shadow-card">
        <h2 className="text-base font-semibold text-foreground">แก้ไขรายการ</h2>
        <form action={updateCollection} className="mt-4 grid gap-4 lg:grid-cols-2">
          <input type="hidden" name="collectionId" value={collection.id} />
          <div>
            <Label htmlFor="title">ชื่อรายการ</Label>
            <Input id="title" name="title" defaultValue={collection.title} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="status">สถานะ</Label>
            <select
              id="status"
              name="status"
              defaultValue={collection.status}
              className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="DRAFT">ฉบับร่าง</option>
              <option value="OPEN">เปิดรับชำระ</option>
              <option value="CLOSED">ปิดรับชำระ</option>
              <option value="ARCHIVED">เก็บเป็นประวัติ</option>
            </select>
          </div>
          <div>
            <Label htmlFor="dueDate">กำหนดชำระ</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={collection.dueDate ?? ""}
              className="mt-1.5"
            />
          </div>
          <div className="lg:col-span-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={collection.description}
              className="mt-1.5"
            />
          </div>
          <div className="flex flex-wrap gap-2 lg:col-span-2">
            <Button type="submit">
              <Save className="size-4" />
              บันทึก
            </Button>
          </div>
        </form>
        <form action={deleteCollection} className="mt-3">
          <input type="hidden" name="collectionId" value={collection.id} />
          <Button type="submit" variant="destructive">
            <Trash2 className="size-4" />
            ลบรายการ
          </Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          การลบรายการจะลบยอดที่ต้องชำระและสลิปที่ผูกกับรายการนี้ออกจากฐานข้อมูลด้วย
        </p>
      </section>

      <h2 className="mt-8 mb-3 text-lg font-semibold text-foreground">สมาชิกและยอดต่อคน</h2>

      <section className="mb-4 rounded-xl border bg-card p-5 shadow-card">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <UserPlus className="size-4 text-primary" />
          เพิ่มสมาชิกในรายการ
        </h3>
        <form
          action={addCollectionMember}
          className="mt-4 grid gap-4 md:grid-cols-[1fr_12rem_auto]"
        >
          <input type="hidden" name="collectionId" value={collection.id} />
          <div>
            <Label htmlFor="userId">สมาชิก</Label>
            <select
              id="userId"
              name="userId"
              className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              defaultValue=""
            >
              <option value="" disabled>
                เลือกสมาชิก
              </option>
              {availableMembers.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} ({profile.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="requiredAmount">ยอดที่ต้องชำระ</Label>
            <Input
              id="requiredAmount"
              name="requiredAmount"
              inputMode="decimal"
              className="text-numeric mt-1.5"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={availableMembers.length === 0}>
              เพิ่มสมาชิก
            </Button>
          </div>
        </form>
        {availableMembers.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            สมาชิกที่ใช้งานได้ทั้งหมดอยู่ในรายการนี้แล้ว
          </p>
        ) : null}
      </section>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>สมาชิก</TableHead>
              <TableHead className="text-right">ต้องชำระ</TableHead>
              <TableHead className="text-right">อนุมัติแล้ว</TableHead>
              <TableHead className="text-right">รอตรวจ</TableHead>
              <TableHead className="text-right">คงเหลือ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {views.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  ยังไม่ได้กำหนดสมาชิกสำหรับรายการนี้
                </TableCell>
              </TableRow>
            ) : (
              views.map((view) => (
                <TableRow key={view.obligation.id}>
                  <TableCell className="font-medium">{view.member.name}</TableCell>
                  <TableCell className="text-numeric text-right">
                    <form action={updateCollectionMember} className="ml-auto flex max-w-40 gap-2">
                      <input type="hidden" name="collectionId" value={collection.id} />
                      <input type="hidden" name="obligationId" value={view.obligation.id} />
                      <Input
                        name="requiredAmount"
                        inputMode="decimal"
                        defaultValue={view.obligation.requiredAmount}
                        className="text-numeric h-8"
                      />
                      <Button size="sm" variant="outline" type="submit">
                        บันทึก
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell className="text-numeric text-right text-success">
                    ฿{formatTHB(view.approved)}
                  </TableCell>
                  <TableCell className="text-numeric text-right text-warning-foreground">
                    ฿{formatTHB(view.pending)}
                  </TableCell>
                  <TableCell className="text-numeric text-right font-medium">
                    ฿{formatTHB(view.remaining)}
                  </TableCell>
                  <TableCell>
                    <FinancialStatusBadge status={view.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={deleteCollectionMember} className="inline-flex">
                      <input type="hidden" name="collectionId" value={collection.id} />
                      <input type="hidden" name="obligationId" value={view.obligation.id} />
                      <Button size="sm" variant="destructive" type="submit">
                        ลบ
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}
