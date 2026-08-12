import { Link } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { currentAdmin, currentUser } from "@/lib/fundflow-data";

type NavItem = { to: string; label: string; exact?: boolean };

const userNav: NavItem[] = [{ to: "/dashboard", label: "รายการของฉัน", exact: true }];

const adminNav: NavItem[] = [
  { to: "/admin", label: "ภาพรวม", exact: true },
  { to: "/admin/collections", label: "รายการเก็บเงิน" },
  { to: "/admin/payments", label: "ตรวจสลิป" },
  { to: "/admin/users", label: "สมาชิก" },
];

export function AppShell({
  variant,
  children,
}: {
  variant: "user" | "admin";
  children: React.ReactNode;
}) {
  const nav = variant === "admin" ? adminNav : userNav;
  const person = variant === "admin" ? currentAdmin : currentUser;

  return (
    <div className="min-h-screen bg-background">
      <header className="surface-deep sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gold text-gold-foreground">
              <Wallet className="size-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">FundFlow</span>
          </Link>

          <nav className="order-3 -mx-1 flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:mx-0 sm:w-auto">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact ?? false }}
                className="rounded-md px-3 py-1.5 text-sm text-primary-deep-foreground/70 transition-colors hover:bg-white/10 hover:text-primary-deep-foreground data-[status=active]:bg-white/15 data-[status=active]:text-primary-deep-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link
              to={variant === "admin" ? "/dashboard" : "/admin"}
              className="hidden text-xs text-primary-deep-foreground/60 underline-offset-4 hover:underline sm:inline"
            >
              {variant === "admin" ? "มุมมองสมาชิก" : "มุมมองผู้ดูแล"}
            </Link>
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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-muted-foreground sm:px-6">
        FundFlow บันทึกและตรวจสอบหลักฐานการโอน — ไม่ได้เป็นระบบโอนเงินจริง
      </footer>
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
