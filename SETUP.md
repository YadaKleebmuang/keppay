# แผนขั้นตอนการติดตั้งและตั้งค่าโปรเจกต์ Keppay สำหรับพัฒนาบนเครื่องของคุณ (Local Setup)

คู่มือนี้แนะนำขั้นตอนทีละสเต็ปเพื่อช่วยให้คุณสามารถรันและพัฒนาโปรเจกต์ Keppay บนเครื่องของตนเองได้สำเร็จ:

---

## ขั้นตอนที่ 1: ติดตั้งโปรแกรมพื้นฐาน (Prerequisites)

ก่อนอื่น ตรวจสอบให้มั่นใจว่าเครื่องของคุณมีสิ่งเหล่านี้ติดตั้งอยู่แล้ว:
* **Node.js** (แนะนำเวอร์ชัน 18 ขึ้นไป)
* **Bun** (แนะนำ เนื่องจากโปรเจกต์นี้มีไฟล์ `bun.lock` ซึ่งจะช่วยให้ติดตั้ง Dependencies ได้ไวกว่า npm มาก)
  * *หากยังไม่มี Bun สามารถติดตั้งผ่าน Terminal ด้วยคำสั่งนี้:*
    ```sh
    curl -fsSL https://bun.sh/install | bash
    ```
    *(หมายเหตุ: หากต้องการใช้ `npm` แทนก็สามารถใช้ได้เช่นกัน)*

---

## ขั้นตอนที่ 2: ติดตั้ง Dependencies ของโปรเจกต์

เปิด Terminal แล้วสลับมายังโฟลเดอร์โปรเจกต์ จากนั้นรันคำสั่ง:

* **หากใช้ Bun (แนะนำ):**
  ```sh
  bun install
  ```
* **หากต้องการใช้ npm:**
  ```sh
  npm install
  ```

---

## ขั้นตอนที่ 3: ตั้งค่า Environment Variables (.env.local)

1. คัดลอกไฟล์ `.env.example` ไปสร้างเป็นไฟล์ใหม่ชื่อ `.env.local` ด้วยคำสั่งนี้:
   ```sh
   cp .env.example .env.local
   ```
2. เปิดไฟล์ `.env.local` และเตรียมกรอกค่าของ Supabase (ที่จะได้จากขั้นตอนถัดไป):
   ```text
   NEXT_PUBLIC_SUPABASE_URL=ของคุณ
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ของคุณ
   SUPABASE_SERVICE_ROLE_KEY=ของคุณ
   ```

---

## ขั้นตอนที่ 4: ตั้งค่าฐานข้อมูลบน Supabase

โปรเจกต์นี้ต้องการ Database ในการจัดเก็บข้อมูลการเงินและโปรไฟล์ สามารถตั้งค่าได้ตามนี้ครับ:

1. เข้าไปที่ [Supabase Dashboard](https://supabase.com) แล้วสร้างโปรเจกต์ใหม่ (Create a new project)
2. นำข้อมูล URL และ Keys มากรอกในไฟล์ `.env.local` ที่สร้างไว้ในขั้นตอนก่อนหน้า:
   * นำ **Project URL** มาใส่ใน `NEXT_PUBLIC_SUPABASE_URL`
   * นำ **API key (anon / public)** มาใส่ใน `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * นำ **service_role key (secret)** มาใส่ใน `SUPABASE_SERVICE_ROLE_KEY`
3. **ติดตั้ง Database Schema (Table ต่างๆ):**
   * *หากใช้ Database ตัวเดิมที่มีการสร้างตารางไว้แล้ว สามารถข้ามข้อนี้ได้เลยครับ*
   * ในเมนูด้านซ้ายของ Supabase ให้เลือก **SQL Editor**
   * กดปุ่ม **New query** (หรือสร้างสคริปต์ใหม่)
   * คัดลอกเนื้อหาทั้งหมดในไฟล์ [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) ไปวางในช่อง SQL Editor จากนั้นกดปุ่ม **Run**
   *(ขั้นตอนนี้จะสร้างตาราง profiles, collections, obligations, และ payments ขึ้นมารวมถึงสิทธิ์ความปลอดภัยต่างๆ)*

---

## ขั้นตอนที่ 5: ตั้งค่าสิทธิ์การล็อกอินด้วย Google (Google OAuth)

1. ในหน้าโปรเจกต์ Supabase ไปที่ **Authentication** > **Providers**
2. ค้นหาผู้ให้บริการล็อกอินชื่อ **Google** แล้วกดเปิดใช้ (Enable)
3. ป้อน **Client ID** และ **Client Secret** ที่สร้างจาก [Google Cloud Console](https://console.cloud.google.com/)
4. คัดลอก **Redirect URL** ที่ได้จาก Supabase นำไปตั้งค่าเป็น Authorized redirect URIs ใน Google Cloud Console
5. บน Supabase ให้เพิ่ม Redirect URL สำหรับเครื่องของคุณเข้าไปในส่วนของ Site URL และ Additional Redirect URLs ด้วย:
   * `http://localhost:3000/auth/callback`

---

## ขั้นตอนที่ 6: รันโปรเจกต์บนเครื่องตนเอง (Development Mode)

เมื่อติดตั้งและตั้งค่าทุกอย่างเสร็จสิ้นแล้ว คุณสามารถสตาร์ทเซิร์ฟเวอร์เพื่อเริ่มงานได้เลย:

* **หากใช้ Bun:**
  ```sh
  bun run dev
  ```
* **หากใช้ npm:**
  ```sh
  npm run dev
  ```

จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:3000` เพื่อใช้งานแอปพลิเคชันครับ!
