import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Archive, Lock, Pencil, Send, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader, StatCard } from "@/components/fundflow/app-shell";
import { CollectionStatusBadge, FinancialStatusBadge } from "@/components/fundflow/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { collectionById, formatTHB, obligationViewsForCollection } from "@/lib/fundflow-data";

export const Route = createFileRoute("/admin/collections/$collectionId")({
  head: () => ({
    meta: [
      { title: "รายละเอียดรายการเก็บเงิน — keppay" },
      {
        name: "description",
        content: "ดูสมาชิกในรายการ ยอดที่ต้องชำระต่อคน ยอดที่อนุมัติแล้ว และยอดคงเหลือ",
      },
      { property: "og:title", content: "รายละเอียดรายการเก็บเงิน — keppay" },
      { property: "og:description", content: "จัดการสมาชิกและยอดต่อคนของรายการเก็บเงิน" },
    ],
  }),
  loader: ({ params }) => {
    const collection = collectionById(params.collectionId);
    if (!collection) throw notFound();
    return { collectionId: collection.id };
  },
  component: CollectionDetail,
});

function CollectionDetail() {
  const { collectionId } = Route.useLoaderData();
  const collection = collectionById(collectionId)!;
  const views = obligationViewsForCollection(collectionId);

  const required = views.reduce((s, v) => s + v.obligation.requiredAmount, 0);
  const approved = views.reduce((s, v) => s + v.approved, 0);
  const pending = views.reduce((s, v) => s + v.pending, 0);

  return (
    <AppShell variant="admin">
      <Link
        to="/admin/collections"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        กลับไปรายการเก็บเงิน
      </Link>

      <PageHeader
        title={collection.title}
        description={collection.description}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast("แก้ไขรายการ (ตัวอย่าง UI)")}>
              <Pencil className="size-4" />
              แก้ไข
            </Button>
            {collection.status === "DRAFT" ? (
              <Button onClick={() => toast.success("เปิดรับการชำระแล้ว (จำลอง)")}>
                <Send className="size-4" />
                เปิดรับชำระ
              </Button>
            ) : collection.status === "OPEN" ? (
              <Button variant="secondary" onClick={() => toast("ปิดรับการชำระแล้ว (จำลอง)")}>
                <Lock className="size-4" />
                ปิดรับชำระ
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => toast("เก็บเป็นประวัติแล้ว (จำลอง)")}>
                <Archive className="size-4" />
                เก็บเป็นประวัติ
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <CollectionStatusBadge status={collection.status} />
        <span>สร้างเมื่อ {collection.createdAt}</span>
        {collection.dueDate ? <span>กำหนดชำระ {collection.dueDate}</span> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="ยอดที่ต้องเก็บ" value={`฿${formatTHB(required)}`} />
        <StatCard label="อนุมัติแล้ว" value={`฿${formatTHB(approved)}`} tone="success" />
        <StatCard label="รอตรวจสอบ" value={`฿${formatTHB(pending)}`} tone="warning" />
      </div>

      <div className="mt-8 mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">สมาชิกและยอดต่อคน</h2>
        <Button variant="outline" size="sm" onClick={() => toast("เพิ่มสมาชิก (ตัวอย่าง UI)")}>
          <UserPlus className="size-4" />
          เพิ่มสมาชิก
        </Button>
      </div>

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {views.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  ยังไม่ได้กำหนดสมาชิกสำหรับรายการนี้
                </TableCell>
              </TableRow>
            ) : (
              views.map((v) => (
                <TableRow key={v.obligation.id}>
                  <TableCell className="font-medium">{v.member.name}</TableCell>
                  <TableCell className="text-numeric text-right">
                    ฿{formatTHB(v.obligation.requiredAmount)}
                  </TableCell>
                  <TableCell className="text-numeric text-right text-success">
                    ฿{formatTHB(v.approved)}
                  </TableCell>
                  <TableCell className="text-numeric text-right text-warning-foreground">
                    ฿{formatTHB(v.pending)}
                  </TableCell>
                  <TableCell className="text-numeric text-right font-medium">
                    ฿{formatTHB(v.remaining)}
                  </TableCell>
                  <TableCell>
                    <FinancialStatusBadge status={v.status} />
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
