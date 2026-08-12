import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/fundflow/app-shell";
import { AccountStatusBadge, StatusBadge } from "@/components/fundflow/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currentAdmin, profiles } from "@/lib/fundflow-data";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "จัดการสมาชิก — FundFlow" },
      {
        name: "description",
        content: "อนุมัติผู้ใช้ใหม่ ระงับบัญชี และดูสิทธิ์ของสมาชิกในกลุ่ม",
      },
      { property: "og:title", content: "จัดการสมาชิก — FundFlow" },
      { property: "og:description", content: "อนุมัติหรือระงับบัญชีสมาชิกของกลุ่ม" },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  return (
    <AppShell variant="admin">
      <PageHeader
        title="สมาชิก"
        description="ผู้ใช้ใหม่จะอยู่ในสถานะรออนุมัติจนกว่าผู้ดูแลจะเปิดใช้งาน สิทธิ์ผู้ดูแลกำหนดจากรายชื่อที่อนุญาตเท่านั้น"
      />

      <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead>สิทธิ์</TableHead>
              <TableHead>สถานะบัญชี</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => {
              const isSelf = p.id === currentAdmin.id;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-sm text-secondary-foreground">
                        {p.initials}
                      </span>
                      {p.name}
                      {isSelf ? (
                        <span className="text-xs text-muted-foreground">(คุณ)</span>
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.email}</TableCell>
                  <TableCell>
                    <StatusBadge tone={p.role === "ADMIN" ? "gold" : "neutral"}>
                      {p.role === "ADMIN" ? "ผู้ดูแล" : "สมาชิก"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <AccountStatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {isSelf ? (
                      <span className="text-xs text-muted-foreground">
                        ไม่สามารถแก้บัญชีของตัวเองได้
                      </span>
                    ) : p.status === "PENDING" ? (
                      <Button size="sm" onClick={() => toast.success(`เปิดใช้งาน ${p.name} แล้ว (จำลอง)`)}>
                        อนุมัติให้ใช้งาน
                      </Button>
                    ) : p.status === "ACTIVE" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast(`ระงับบัญชี ${p.name} แล้ว (จำลอง)`)}
                      >
                        ระงับบัญชี
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toast.success(`คืนสิทธิ์ ${p.name} แล้ว (จำลอง)`)}
                      >
                        เปิดใช้งานอีกครั้ง
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}
