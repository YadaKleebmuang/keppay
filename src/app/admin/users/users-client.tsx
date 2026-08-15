"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { deleteUser, setUserRole, setUserStatus, updateUserProfile } from "./actions";

import type { Profile, AccountStatus, Role } from "@/lib/fundflow-data";
import type { AdminData } from "@/lib/fundflow-repository";

export function UsersClient({ data }: { data: AdminData }) {
  const [isPending, setIsPending] = useState(false);

  const handleAction = (action: (formData: FormData) => Promise<void>, successMessage: string) => {
    return async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isPending) return;
      setIsPending(true);

      const form = e.currentTarget;
      const formData = new FormData(form);

      try {
        await action(formData);
        toast.success(successMessage);
      } catch (err: any) {
        if (
          err?.message === "NEXT_REDIRECT" ||
          err?.digest?.includes("NEXT_REDIRECT") ||
          String(err).includes("NEXT_REDIRECT")
        ) {
          // Let Next.js handle redirect
          throw err;
        }
        toast.error(err.message || "เกิดข้อผิดพลาดในการดำเนินงาน");
      } finally {
        setIsPending(false);
      }
    };
  };

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
                      <form onSubmit={handleAction(updateUserProfile, "อัปเดตชื่อผู้ใช้เรียบร้อย")} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={p.id} />
                        <Input
                          name="name"
                          defaultValue={p.name}
                          disabled={isSelf || isPending}
                          className="h-8 w-44"
                        />
                        {!isSelf ? (
                          <Button size="sm" variant="outline" type="submit" disabled={isPending}>
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
                        <form onSubmit={handleAction(setUserRole, "เปลี่ยนสิทธิ์การใช้งานเรียบร้อย")}>
                          <input type="hidden" name="userId" value={p.id} />
                          <input
                            type="hidden"
                            name="role"
                            value={p.role === "ADMIN" ? "USER" : "ADMIN"}
                          />
                          <Button size="sm" variant="outline" type="submit" disabled={isPending}>
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
                          <form onSubmit={handleAction(setUserStatus, "อนุมัติบัญชีผู้ใช้เรียบร้อย")}>
                            <input type="hidden" name="userId" value={p.id} />
                            <input type="hidden" name="status" value="ACTIVE" />
                            <Button size="sm" type="submit" disabled={isPending}>
                              อนุมัติ
                            </Button>
                          </form>
                        ) : (
                          <form onSubmit={handleAction(setUserStatus, "ระงับบัญชีผู้ใช้เรียบร้อย")}>
                            <input type="hidden" name="userId" value={p.id} />
                            <input type="hidden" name="status" value="DISABLED" />
                            <Button size="sm" variant="outline" type="submit" disabled={isPending}>
                              ระงับ
                            </Button>
                          </form>
                        )}
                        {p.status === "DISABLED" ? (
                          <form onSubmit={handleAction(setUserStatus, "เปิดใช้งานบัญชีผู้ใช้เรียบร้อย")}>
                            <input type="hidden" name="userId" value={p.id} />
                            <input type="hidden" name="status" value="ACTIVE" />
                            <Button size="sm" variant="secondary" type="submit" disabled={isPending}>
                              เปิดใช้
                            </Button>
                          </form>
                        ) : null}
                        <form onSubmit={handleAction(deleteUser, "ลบสมาชิกเรียบร้อย")}>
                          <input type="hidden" name="userId" value={p.id} />
                          <Button size="sm" variant="destructive" type="submit" disabled={isPending}>
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
                    <form onSubmit={handleAction(updateUserProfile, "อัปเดตชื่อผู้ใช้เรียบร้อย")} className="flex items-center gap-1.5">
                      <input type="hidden" name="userId" value={p.id} />
                      <Input
                        name="name"
                        defaultValue={p.name}
                        disabled={isSelf || isPending}
                        className="h-8 w-full min-w-0 flex-1 text-sm"
                      />
                      {!isSelf && (
                        <Button size="sm" variant="outline" type="submit" disabled={isPending} className="h-8 px-2.5 text-xs shrink-0">
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
                      <form onSubmit={handleAction(setUserRole, "เปลี่ยนสิทธิ์การใช้งานเรียบร้อย")}>
                        <input type="hidden" name="userId" value={p.id} />
                        <input
                          type="hidden"
                          name="role"
                          value={p.role === "ADMIN" ? "USER" : "ADMIN"}
                        />
                        <Button size="sm" variant="outline" type="submit" disabled={isPending} className="h-7 px-2 text-[10px]">
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
                      <form onSubmit={handleAction(setUserStatus, "อนุมัติบัญชีผู้ใช้เรียบร้อย")} className="flex-1 min-w-[70px]">
                        <input type="hidden" name="userId" value={p.id} />
                        <input type="hidden" name="status" value="ACTIVE" />
                        <Button size="sm" type="submit" disabled={isPending} className="w-full text-xs h-8">
                          อนุมัติ
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleAction(setUserStatus, "ระงับบัญชีผู้ใช้เรียบร้อย")} className="flex-1 min-w-[70px]">
                        <input type="hidden" name="userId" value={p.id} />
                        <input type="hidden" name="status" value="DISABLED" />
                        <Button size="sm" variant="outline" type="submit" disabled={isPending} className="w-full text-xs h-8">
                          ระงับ
                        </Button>
                      </form>
                    )}
                    {p.status === "DISABLED" && (
                      <form onSubmit={handleAction(setUserStatus, "เปิดใช้งานบัญชีผู้ใช้เรียบร้อย")} className="flex-1 min-w-[70px]">
                        <input type="hidden" name="userId" value={p.id} />
                        <input type="hidden" name="status" value="ACTIVE" />
                        <Button size="sm" variant="secondary" type="submit" disabled={isPending} className="w-full text-xs h-8">
                          เปิดใช้
                        </Button>
                      </form>
                    )}
                    <form onSubmit={handleAction(deleteUser, "ลบสมาชิกเรียบร้อย")} className="flex-1 min-w-[50px] max-w-[60px]">
                      <input type="hidden" name="userId" value={p.id} />
                      <Button size="sm" variant="destructive" type="submit" disabled={isPending} className="w-full text-xs h-8">
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

      {/* หน้าจอ Loading Overlay เมื่อกดส่งบันทึกข้อมูล */}
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
                ระบบกำลังอัปเดตสิทธิ์และสถานะสมาชิก กรุณารอสักครู่ (ห้ามปิดหน้านี้)
              </p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
