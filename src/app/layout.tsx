import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "../styles.css";

export const metadata: Metadata = {
  title: "keppay — ระบบเก็บเงินและติดตามการชำระในกลุ่ม",
  description: "keppay ช่วยจัดการรายการเก็บเงินในกลุ่ม รับสลิป ตรวจสอบ และสรุปยอดคงเหลือ",
  openGraph: {
    title: "keppay — ระบบเก็บเงินและติดตามการชำระในกลุ่ม",
    description: "สร้างรายการเก็บเงิน กำหนดยอดต่อคน รับสลิป และตรวจสอบการชำระในที่เดียว",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
