"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  LayoutDashboard,
  ListChecks,
  Receipt,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { currentAdmin, currentUser, type Profile } from "@/lib/fundflow-data";

type NavItem = { to: string; label: string; short: string; icon: LucideIcon; exact?: boolean };

const userNav: NavItem[] = [
  {
    to: "/dashboard",
    label: "รายการของฉัน",
    short: "รายการ",
    icon: Receipt,
    exact: true,
  },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "ภาพรวม", short: "ภาพรวม", icon: LayoutDashboard, exact: true },
  { to: "/admin/collections", label: "รายการเก็บเงิน", short: "รายการ", icon: ListChecks },
  { to: "/admin/payments", label: "ตรวจสลิป", short: "ตรวจสลิป", icon: ClipboardCheck },
  { to: "/admin/users", label: "สมาชิก", short: "สมาชิก", icon: Users },
];

export function AppShell({
  variant,
  children,
  profile,
}: {
  variant: "user" | "admin";
  children: React.ReactNode;
  profile?: Profile;
}) {
  const nav = variant === "admin" ? adminNav : userNav;
  const person = profile ?? (variant === "admin" ? currentAdmin : currentUser);
  const canAccessAdmin = person.role === "ADMIN";
  const pathname = usePathname();
  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);

  return (
    <div className="min-h-screen bg-background">
      <header className="surface-deep sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gold text-gold-foreground">
              <Wallet className="size-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">keppay</span>
          </Link>

          <nav className="order-3 -mx-1 hidden w-full items-center gap-1 overflow-x-auto sm:order-none sm:mx-0 sm:w-auto lg:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm text-primary-deep-foreground/70 transition-colors hover:bg-white/10 hover:text-primary-deep-foreground",
                  isActive(item) && "bg-white/15 text-primary-deep-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {variant === "admin" ? (
              <Link
                href="/dashboard"
                className="hidden text-xs text-primary-deep-foreground/60 underline-offset-4 hover:underline lg:inline"
              >
                มุมมองสมาชิก
              </Link>
            ) : canAccessAdmin ? (
              <Link
                href="/admin"
                className="hidden text-xs text-primary-deep-foreground/60 underline-offset-4 hover:underline lg:inline"
              >
                มุมมองผู้ดูแล
              </Link>
            ) : null}
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-white/15 text-sm font-medium">
                {person.initials}
              </span>
              <span className="hidden text-sm leading-tight sm:block">
                {person.name}
                <span className="block text-[11px] text-primary-deep-foreground/60">
                  {variant === "admin" ? "ผู้ดูแล" : "สมาชิก"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 lg:pb-8">{children}</main>

      <footer className="mx-auto max-w-6xl px-4 pb-24 text-xs text-muted-foreground sm:px-6 lg:pb-10">
        keppay บันทึกและตรวจสอบหลักฐานการโอน — ไม่ได้เป็นระบบโอนเงินจริง
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-stretch justify-around px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {nav.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "flex min-w-16 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(item) && "bg-primary/8 text-primary",
              )}
            >
              <item.icon className="size-5" />
              <span>{item.short}</span>
            </Link>
          ))}
          {variant === "admin" ? (
            <Link
              href="/dashboard"
              className="flex min-w-16 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Wallet className="size-5" />
              <span>มุมมองฉัน</span>
            </Link>
          ) : canAccessAdmin ? (
            <Link
              href="/admin"
              className="flex min-w-16 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ClipboardCheck className="size-5" />
              <span>ผู้ดูแล</span>
            </Link>
          ) : null}
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "primary" | "warning" | "success";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-card",
        tone === "primary" && "border-primary/20 bg-primary/5",
        tone === "warning" && "border-warning/25 bg-warning/10",
        tone === "success" && "border-success/25 bg-success/8",
      )}
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-numeric mt-2 text-2xl font-semibold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
