import { AppShell, PageHeader } from "@/components/fundflow/app-shell";
import { AccountStatusBadge, StatusBadge } from "@/components/fundflow/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminData } from "@/lib/fundflow-repository";
import { deleteUser, setUserRole, setUserStatus, updateUserProfile } from "./actions";

export default async function UsersPage() {
  const data = await getAdminData();

  return (
    <AppShell variant="admin" profile={data.profile}>
      <PageHeader
        title="สมาชิก"
        description="ผู้ใช้ใหม่จะอยู่ในสถานะรออนุมัติจนกว่าผู้ดูแลจะเปิดใช้งาน สิทธิ์ผู้ดูแลกำหนดจากรายชื่อที่อนุญาตเท่านั้น"
      />

      {/* ตารางแสดงผลบนคอมพิวเตอร์ (Desktop Table) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border bg-card shadow-card">
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
            {data.profiles.map((p) => {
              const isSelf = p.id === data.profile.id;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <div className="flex min-w-60 items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-sm text-secondary-foreground">
                        {p.initials}
                      </span>
                      <form action={updateUserProfile} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={p.id} />
                        <Input
                          name="name"
                          defaultValue={p.name}
                          disabled={isSelf}
                          className="h-8 w-44"
                        />
                        {!isSelf ? (
                          <Button size="sm" variant="outline" type="submit">
                            แก้ไข
                          </Button>
                        ) : null}
                      </form>
                      {isSelf ? <span className="text-xs text-muted-foreground">(คุณ)</span> : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={p.role === "ADMIN" ? "gold" : "neutral"}>
                        {p.role === "ADMIN" ? "ผู้ดูแล" : "สมาชิก"}
                      </StatusBadge>
                      {!isSelf ? (
                        <form action={setUserRole}>
                          <input type="hidden" name="userId" value={p.id} />
                          <input
                            type="hidden"
                            name="role"
                            value={p.role === "ADMIN" ? "USER" : "ADMIN"}
                          />
                          <Button size="sm" variant="outline" type="submit">
                            {p.role === "ADMIN" ? "ลดสิทธิ์" : "ตั้งเป็นผู้ดูแล"}
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <AccountStatusBadge status={p.status} />
                  </TableCell>
                  <TableCell>
                    {isSelf ? (
                      <span className="text-xs text-muted-foreground">
                        ไม่สามารถแก้บัญชีของตัวเองได้
                      </span>
                    ) : (
                      <div className="flex flex-wrap justify-end gap-2">
                        {p.status !== "ACTIVE" ? (
                          <form action={setUserStatus}>
                            <input type="hidden" name="userId" value={p.id} />
                            <input type="hidden" name="status" value="ACTIVE" />
                            <Button size="sm" type="submit">
                              อนุมัติ
                            </Button>
                          </form>
                        ) : (
                          <form action={setUserStatus}>
                            <input type="hidden" name="userId" value={p.id} />
                            <input type="hidden" name="status" value="DISABLED" />
                            <Button size="sm" variant="outline" type="submit">
                              ระงับ
                            </Button>
                          </form>
                        )}
                        {p.status === "DISABLED" ? (
                          <form action={setUserStatus}>
                            <input type="hidden" name="userId" value={p.id} />
                            <input type="hidden" name="status" value="ACTIVE" />
                            <Button size="sm" variant="secondary" type="submit">
                              เปิดใช้
                            </Button>
                          </form>
                        ) : null}
                        <form action={deleteUser}>
                          <input type="hidden" name="userId" value={p.id} />
                          <Button size="sm" variant="destructive" type="submit">
                            ลบ
                          </Button>
                        </form>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* การ์ดแสดงผลบนมือถือ (Mobile Cards) */}
      <div className="md:hidden space-y-4">
        {data.profiles.map((p) => {
          const isSelf = p.id === data.profile.id;
          return (
            <div key={p.id} className="rounded-xl border bg-card p-4 shadow-card space-y-3.5">
              {/* ส่วนหัว: Avatar, ชื่อ และ สถานะบัญชี */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                    {p.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <form action={updateUserProfile} className="flex items-center gap-1.5">
                      <input type="hidden" name="userId" value={p.id} />
                      <Input
                        name="name"
                        defaultValue={p.name}
                        disabled={isSelf}
                        className="h-8 w-full min-w-0 flex-1 text-sm"
                      />
                      {!isSelf && (
                        <Button size="sm" variant="outline" type="submit" className="h-8 px-2.5 text-xs shrink-0">
                          แก้ไข
                        </Button>
                      )}
                    </form>
                  </div>
                  {isSelf && <span className="text-xs text-muted-foreground shrink-0">(คุณ)</span>}
                </div>
                <div className="shrink-0">
                  <AccountStatusBadge status={p.status} />
                </div>
              </div>

              {/* รายละเอียด: อีเมล, สิทธิ์ */}
              <div className="space-y-2 text-xs text-muted-foreground border-t border-b py-2.5">
                <div className="flex justify-between gap-2">
                  <span>อีเมล</span>
                  <span className="text-foreground font-medium truncate max-w-[200px]">{p.email}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>สิทธิ์การใช้งาน</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge tone={p.role === "ADMIN" ? "gold" : "neutral"}>
                      {p.role === "ADMIN" ? "ผู้ดูแล" : "สมาชิก"}
                    </StatusBadge>
                    {!isSelf && (
                      <form action={setUserRole}>
                        <input type="hidden" name="userId" value={p.id} />
                        <input
                          type="hidden"
                          name="role"
                          value={p.role === "ADMIN" ? "USER" : "ADMIN"}
                        />
                        <Button size="sm" variant="outline" type="submit" className="h-7 px-2 text-[10px]">
                          {p.role === "ADMIN" ? "ลดสิทธิ์" : "ตั้งเป็นผู้ดูแล"}
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* ส่วนควบคุมและปุ่มการจัดการด้านล่าง */}
              <div className="flex justify-end items-center">
                {isSelf ? (
                  <span className="text-xs text-muted-foreground">
                    ไม่สามารถแก้บัญชีของตัวเองได้
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-2 w-full justify-end">
                    {p.status !== "ACTIVE" ? (
                      <form action={setUserStatus} className="flex-1 min-w-[70px]">
                        <input type="hidden" name="userId" value={p.id} />
                        <input type="hidden" name="status" value="ACTIVE" />
                        <Button size="sm" type="submit" className="w-full text-xs h-8">
                          อนุมัติ
                        </Button>
                      </form>
                    ) : (
                      <form action={setUserStatus} className="flex-1 min-w-[70px]">
                        <input type="hidden" name="userId" value={p.id} />
                        <input type="hidden" name="status" value="DISABLED" />
                        <Button size="sm" variant="outline" type="submit" className="w-full text-xs h-8">
                          ระงับ
                        </Button>
                      </form>
                    )}
                    {p.status === "DISABLED" && (
                      <form action={setUserStatus} className="flex-1 min-w-[70px]">
                        <input type="hidden" name="userId" value={p.id} />
                        <input type="hidden" name="status" value="ACTIVE" />
                        <Button size="sm" variant="secondary" type="submit" className="w-full text-xs h-8">
                          เปิดใช้
                        </Button>
                      </form>
                    )}
                    <form action={deleteUser} className="flex-1 min-w-[50px] max-w-[60px]">
                      <input type="hidden" name="userId" value={p.id} />
                      <Button size="sm" variant="destructive" type="submit" className="w-full text-xs h-8">
                        ลบ
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
