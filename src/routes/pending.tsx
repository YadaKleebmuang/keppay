import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Wallet } from "lucide-react";

export const Route = createFileRoute("/pending")({
  head: () => ({
    meta: [
      { title: "รออนุมัติบัญชี — keppay" },
      {
        name: "description",
        content: "บัญชีของคุณถูกสร้างแล้วและกำลังรอผู้ดูแลอนุมัติให้เข้าใช้งาน keppay",
      },
      { property: "og:title", content: "รออนุมัติบัญชี — keppay" },
      { property: "og:description", content: "บัญชีของคุณกำลังรอผู้ดูแลอนุมัติ" },
    ],
  }),
  component: PendingPage,
});

function PendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-raised">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-warning/15 text-warning-foreground">
          <Clock className="size-5.5" />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-foreground">บัญชีกำลังรออนุมัติ</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          เราสร้างบัญชีของคุณเรียบร้อยแล้ว แต่ผู้ดูแลกลุ่มยังต้องอนุมัติก่อนเข้าใช้งาน
          โปรดติดต่อผู้ดูแลหรือกลับมาลองใหม่อีกครั้งภายหลัง
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <Wallet className="size-4" />
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
}
