import { createFileRoute, Link } from "@tanstack/react-router";
import { Ban, Wallet } from "lucide-react";

export const Route = createFileRoute("/disabled")({
  head: () => ({
    meta: [
      { title: "บัญชีถูกระงับ — FundFlow" },
      {
        name: "description",
        content: "บัญชีนี้ถูกระงับการใช้งาน โปรดติดต่อผู้ดูแลกลุ่มเพื่อขอเปิดใช้งานอีกครั้ง",
      },
      { property: "og:title", content: "บัญชีถูกระงับ — FundFlow" },
      { property: "og:description", content: "ติดต่อผู้ดูแลเพื่อขอเปิดใช้งานบัญชีอีกครั้ง" },
    ],
  }),
  component: DisabledPage,
});

function DisabledPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-raised">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-destructive/12 text-destructive">
          <Ban className="size-5.5" />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-foreground">บัญชีถูกระงับการใช้งาน</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          ผู้ดูแลได้ระงับบัญชีนี้ไว้ ทำให้เข้าถึงข้อมูลรายการเก็บเงินไม่ได้
          หากคิดว่าเป็นความผิดพลาด โปรดติดต่อผู้ดูแลกลุ่มของคุณ
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
