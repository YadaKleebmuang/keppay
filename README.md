# 👛 keppay — บันทึกและตรวจสอบหลักฐานการเงินในกลุ่ม

แอปพลิเคชันสำหรับจัดการและตรวจสอบยอดเงินกองกลางในกลุ่ม จบครบในที่เดียว ไม่ต้องตามความถูกต้องของสลิปในแชตอีกต่อไป! 

**Live Demo**: [https://render-replicate-it.lovable.app](https://render-replicate-it.lovable.app)

---

## 🌟 ฟังก์ชันหลัก (Core Features)

* **Record (บันทึก)**: สร้างรายการเก็บเงิน กำหนดยอดที่สมาชิกแต่ละคนต้องจ่ายได้ไม่เท่ากันอย่างอิสระ
* **Evidence (หลักฐาน)**: สมาชิกอัปโหลดภาพสลิปหลักฐานการโอนได้สะดวก พร้อมสแกนรหัสตรวจสอบสลิปซ้ำผ่าน SHA-256
* **Verify (ตรวจสอบ)**: ระบบตรวจสอบคิวสลิปสำหรับผู้ดูแล (Admin) สามารถอนุมัติหรือปฏิเสธพร้อมป้อนยอดเงินที่ได้รับจริง
* **Responsive Layout**: แสดงผลได้อย่างสวยงาม สมส่วน และใช้งานง่ายบนทุกขนาดหน้าจอ (รวมถึงโทรศัพท์มือถือที่ปรับโฉมเป็นการ์ดรายการแทนตาราง)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

* **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Database / Auth / Storage**: [Supabase](https://supabase.com/)
* **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
* **Package Manager / Runtime**: [Bun](https://bun.sh/)

---

## 🚀 การติดตั้งและพัฒนาภายในเครื่อง (Local Setup)

โปรเจกต์นี้ได้รับการปรับแต่งให้รองรับ **Bun** สำหรับการรันคำสั่งและการติดตั้ง เพื่อความสะดวกและรวดเร็วสูงสุด

### 1. ติดตั้ง Dependencies
```sh
bun install
```

### 2. ตั้งค่าสภาพแวดล้อม (Environment Variables)
คัดลอกไฟล์ `.env.example` ไปเป็น `.env.local` และกรอกข้อมูลสิทธิ์เชื่อมต่อ Supabase:
```sh
cp .env.example .env.local
```

### 3. เริ่มรันระบบสำหรับพัฒนา (Dev Server)
```sh
bun run dev
```
เปิดเบราว์เซอร์และเข้าไปที่ [http://localhost:3000](http://localhost:3000)

สำหรับขั้นตอนการตั้งค่าโครงสร้างฐานข้อมูลและ Supabase Google OAuth แบบละเอียด สามารถดูเพิ่มเติมได้ที่คู่มือ [SETUP.md](file:///Users/ploy/Desktop/mini_project/render-replicate-it/SETUP.md) ครับ

---

## 💡 พัฒนาร่วมกับ Lovable (Built with Lovable)

โปรเจกต์นี้เชื่อมต่อโดยตรงกับ [Lovable](https://lovable.dev) การแก้ไขใดๆ บนกิ่ง (Branch) นี้จะถูกซิงก์กลับไปยังตัวแก้ไขของ Lovable โดยอัตโนมัติ

> [!IMPORTANT]
> หลีกเลี่ยงการ force push หรือแก้ไข git history ย้อนหลังที่ถูกพุชไปแล้ว เพื่อรักษาความเข้ากันได้ของการซิงก์ประวัติของฝั่ง Lovable ครับ
