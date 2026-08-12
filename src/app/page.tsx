import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Wallet } from "lucide-react";
import { signInWithGoogle } from "./auth/actions";

const points = [
  "กำหนดยอดที่แต่ละคนต้องจ่ายได้ไม่เท่ากัน",
  "สมาชิกส่งสลิปได้หลายครั้งต่อหนึ่งรายการ",
  "ยอดการเงินคิดจากสลิปที่ผู้ดูแลอนุมัติแล้วเท่านั้น",
];

export default function Landing() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="surface-deep flex flex-col justify-between px-6 py-10 sm:px-12 lg:py-14">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-gold text-gold-foreground">
            <Wallet className="size-4.5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">FundFlow</span>
        </div>

        <div className="max-w-xl py-12">
          <p className="text-xs tracking-[0.2em] text-gold uppercase">Record · Evidence · Verify</p>
          <h1 className="mt-4 text-3xl leading-tight font-semibold sm:text-4xl">
            เก็บเงินในกลุ่ม จบในที่เดียว
            <br />
            ไม่ต้องตามในแชตอีกต่อไป
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-primary-deep-foreground/70 sm:text-base">
            สร้างรายการเก็บเงิน กำหนดสมาชิกและยอดต่อคน รับสลิปโอนเงิน แล้วให้ผู้ดูแลตรวจสอบอนุมัติ
            พร้อมสรุปยอดคงเหลือของทุกคนแบบอัตโนมัติ
          </p>

          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" />
                <span className="text-primary-deep-foreground/85">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-primary-deep-foreground/50">
          เงินจริงยังโอนผ่านแอปธนาคารตามปกติ FundFlow ทำหน้าที่บันทึกและตรวจสอบหลักฐาน
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-14 sm:px-12">
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-semibold text-foreground">เข้าสู่ระบบ</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            ใช้บัญชี Google ของคุณ ผู้ใช้ใหม่จะอยู่ในสถานะรออนุมัติจากผู้ดูแล
          </p>

          <form action={signInWithGoogle} className="mt-6 space-y-3">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-card transition-colors hover:bg-secondary"
            >
              <GoogleMark />
              เข้าสู่ระบบด้วย Google
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              ตัวอย่างหน้าจอ (ยังเป็นข้อมูลจำลอง)
            </p>
            <div className="mt-3 space-y-1.5">
              <DemoLink href="/dashboard" label="แดชบอร์ดสมาชิก" />
              <DemoLink href="/admin" label="แดชบอร์ดผู้ดูแล" />
              <DemoLink href="/pending" label="หน้ารออนุมัติบัญชี" />
              <DemoLink href="/disabled" label="หน้าบัญชีถูกระงับ" />
            </div>
          </div>

          <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            ข้อมูลการเงินของสมาชิกแยกจากกัน มองเห็นได้เฉพาะเจ้าของและผู้ดูแล
          </p>
        </div>
      </section>
    </div>
  );
}

function DemoLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary"
    >
      {label}
      <ArrowRight className="size-3.5 text-muted-foreground" />
    </Link>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.2h6.6c-.1 1.1-.8 2.7-2.4 3.8v3.1h3.8c2.3-2.1 3.5-5.2 3.5-8.9Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-3c-1 .7-2.4 1.2-4.1 1.2-3.2 0-5.9-2.1-6.9-5H1.2v3.2C3.2 21.4 7.3 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.1 14.3c-.3-.8-.4-1.6-.4-2.3s.1-1.6.4-2.3V6.5H1.2A11.9 11.9 0 0 0 0 12c0 1.9.5 3.8 1.2 5.5l3.9-3.2Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c1.8 0 3.3.6 4.5 1.8l3.3-3.3C17.9 1.2 15.2 0 12 0 7.3 0 3.2 2.6 1.2 6.5l3.9 3.2c1-2.9 3.7-5 6.9-5Z"
      />
    </svg>
  );
}
