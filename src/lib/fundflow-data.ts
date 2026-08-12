// Mock data for the keppay UI prototype. No backend yet.

export type AccountStatus = "PENDING" | "ACTIVE" | "DISABLED";
export type Role = "USER" | "ADMIN";
export type CollectionStatus = "DRAFT" | "OPEN" | "CLOSED" | "ARCHIVED";
export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";
export type FinancialStatus = "UNPAID" | "PARTIAL" | "PAID" | "OVERPAID";

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  initials: string;
};

export type Collection = {
  id: string;
  title: string;
  description: string;
  status: CollectionStatus;
  createdAt: string;
  dueDate?: string;
};

export type Payment = {
  id: string;
  obligationId: string;
  amountEntered: number;
  approvedAmount?: number;
  status: PaymentStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectReason?: string;
  ocrAmount?: number;
  qrDetected: boolean;
  slipHash: string;
  slipPath?: string;
  bank: string;
};

export type Obligation = {
  id: string;
  collectionId: string;
  userId: string;
  requiredAmount: number;
};

export const currentUser: Profile = {
  id: "u-1",
  name: "ณัฐพงษ์ ศรีวรรณ",
  email: "nattapong@example.com",
  role: "USER",
  status: "ACTIVE",
  initials: "ณ",
};

export const currentAdmin: Profile = {
  id: "u-0",
  name: "พิมพ์ชนก ธนโชค",
  email: "pimchanok@example.com",
  role: "ADMIN",
  status: "ACTIVE",
  initials: "พ",
};

export const profiles: Profile[] = [
  currentAdmin,
  currentUser,
  {
    id: "u-2",
    name: "กิตติพงศ์ วัฒนา",
    email: "kittipong@example.com",
    role: "USER",
    status: "ACTIVE",
    initials: "ก",
  },
  {
    id: "u-3",
    name: "สุพิชญา แก้วมณี",
    email: "supitchaya@example.com",
    role: "USER",
    status: "ACTIVE",
    initials: "ส",
  },
  {
    id: "u-4",
    name: "ธนกร อินทรโชติ",
    email: "thanakorn@example.com",
    role: "USER",
    status: "PENDING",
    initials: "ธ",
  },
  {
    id: "u-5",
    name: "วรินทร พงษ์สุข",
    email: "warinthorn@example.com",
    role: "USER",
    status: "DISABLED",
    initials: "ว",
  },
];

export const collections: Collection[] = [
  {
    id: "c-1",
    title: "ค่าทริปเชียงใหม่",
    description: "ค่าที่พัก 2 คืน และค่ารถตู้ระหว่างทริป 14–16 มี.ค.",
    status: "OPEN",
    createdAt: "2026-02-18",
    dueDate: "2026-03-10",
  },
  {
    id: "c-2",
    title: "ค่าเสื้อทีมสีเขียว",
    description: "เสื้อทีมพร้อมสกรีนชื่อด้านหลัง",
    status: "OPEN",
    createdAt: "2026-02-02",
    dueDate: "2026-02-28",
  },
  {
    id: "c-3",
    title: "ค่าอาหารเลี้ยงปิดโครงการ",
    description: "ร้านอาหารกลางเมือง หัวละเท่ากัน",
    status: "CLOSED",
    createdAt: "2026-01-08",
  },
  {
    id: "c-4",
    title: "ค่าเช่าสถานที่ซ้อม",
    description: "ห้องซ้อมรายเดือน (ธ.ค.)",
    status: "ARCHIVED",
    createdAt: "2025-12-01",
  },
  {
    id: "c-5",
    title: "ค่าอุปกรณ์กิจกรรมค่าย",
    description: "ยังเตรียมรายชื่อสมาชิกและยอดต่อคน",
    status: "DRAFT",
    createdAt: "2026-02-24",
  },
];

export const obligations: Obligation[] = [
  { id: "o-1", collectionId: "c-1", userId: "u-1", requiredAmount: 3200 },
  { id: "o-2", collectionId: "c-2", userId: "u-1", requiredAmount: 450 },
  { id: "o-3", collectionId: "c-3", userId: "u-1", requiredAmount: 380 },
  { id: "o-4", collectionId: "c-1", userId: "u-2", requiredAmount: 3200 },
  { id: "o-5", collectionId: "c-1", userId: "u-3", requiredAmount: 2800 },
  { id: "o-6", collectionId: "c-2", userId: "u-2", requiredAmount: 450 },
  { id: "o-7", collectionId: "c-2", userId: "u-3", requiredAmount: 450 },
  { id: "o-8", collectionId: "c-3", userId: "u-2", requiredAmount: 380 },
];

export const payments: Payment[] = [
  {
    id: "p-1",
    obligationId: "o-1",
    amountEntered: 1200,
    approvedAmount: 1200,
    status: "APPROVED",
    submittedAt: "2026-02-20 20:14",
    reviewedAt: "2026-02-21 09:02",
    ocrAmount: 1200,
    qrDetected: true,
    slipHash: "9f2c4a…d71b",
    bank: "กสิกรไทย",
  },
  {
    id: "p-2",
    obligationId: "o-1",
    amountEntered: 800,
    status: "PENDING",
    submittedAt: "2026-03-01 21:40",
    ocrAmount: 800,
    qrDetected: true,
    slipHash: "31ab77…0c4e",
    bank: "ไทยพาณิชย์",
  },
  {
    id: "p-3",
    obligationId: "o-2",
    amountEntered: 450,
    approvedAmount: 450,
    status: "APPROVED",
    submittedAt: "2026-02-10 12:05",
    reviewedAt: "2026-02-10 18:22",
    ocrAmount: 450,
    qrDetected: false,
    slipHash: "aa1902…77f0",
    bank: "กรุงเทพ",
  },
  {
    id: "p-4",
    obligationId: "o-3",
    amountEntered: 400,
    status: "REJECTED",
    submittedAt: "2026-01-12 08:31",
    reviewedAt: "2026-01-12 10:10",
    rejectReason: "สลิปไม่ชัด อ่านยอดและเวลาโอนไม่ได้",
    qrDetected: false,
    slipHash: "5c88de…9931",
    bank: "กรุงไทย",
  },
  {
    id: "p-5",
    obligationId: "o-4",
    amountEntered: 3200,
    status: "PENDING",
    submittedAt: "2026-03-02 10:18",
    ocrAmount: 3210,
    qrDetected: true,
    slipHash: "77de01…b2aa",
    bank: "กสิกรไทย",
  },
  {
    id: "p-6",
    obligationId: "o-5",
    amountEntered: 1400,
    status: "PENDING",
    submittedAt: "2026-03-02 22:47",
    ocrAmount: 1400,
    qrDetected: false,
    slipHash: "c410fa…6d13",
    bank: "ออมสิน",
  },
  {
    id: "p-7",
    obligationId: "o-6",
    amountEntered: 450,
    approvedAmount: 450,
    status: "APPROVED",
    submittedAt: "2026-02-09 19:02",
    reviewedAt: "2026-02-09 20:00",
    ocrAmount: 450,
    qrDetected: true,
    slipHash: "b0f3c1…4412",
    bank: "ไทยพาณิชย์",
  },
];

/* ---------- helpers ---------- */

export const formatTHB = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

export const collectionById = (id: string) => collections.find((c) => c.id === id);
export const profileById = (id: string) => profiles.find((p) => p.id === id);
export const paymentsOf = (obligationId: string) =>
  payments.filter((p) => p.obligationId === obligationId);
export const paymentById = (id: string) => payments.find((p) => p.id === id);
export const obligationById = (id: string) => obligations.find((o) => o.id === id);

export type ObligationView = {
  obligation: Obligation;
  collection: Collection;
  member: Profile;
  approved: number;
  pending: number;
  remaining: number;
  status: FinancialStatus;
  payments: Payment[];
};

export function buildObligationView(obligation: Obligation): ObligationView {
  const list = paymentsOf(obligation.id);
  const approved = list
    .filter((p) => p.status === "APPROVED")
    .reduce((sum, p) => sum + (p.approvedAmount ?? 0), 0);
  const pending = list
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amountEntered, 0);
  const remaining = Math.max(obligation.requiredAmount - approved, 0);

  let status: FinancialStatus = "UNPAID";
  if (approved > obligation.requiredAmount) status = "OVERPAID";
  else if (approved === obligation.requiredAmount) status = "PAID";
  else if (approved > 0) status = "PARTIAL";

  return {
    obligation,
    collection: collectionById(obligation.collectionId)!,
    member: profileById(obligation.userId)!,
    approved,
    pending,
    remaining,
    status,
    payments: list,
  };
}

export const obligationViewsForUser = (userId: string) =>
  obligations.filter((o) => o.userId === userId).map(buildObligationView);

export const obligationViewsForCollection = (collectionId: string) =>
  obligations.filter((o) => o.collectionId === collectionId).map(buildObligationView);

export const pendingPayments = () => payments.filter((p) => p.status === "PENDING");

export const collectionStatusLabel: Record<CollectionStatus, string> = {
  DRAFT: "ฉบับร่าง",
  OPEN: "เปิดรับชำระ",
  CLOSED: "ปิดรับชำระ",
  ARCHIVED: "เก็บเป็นประวัติ",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: "รอตรวจสอบ",
  APPROVED: "อนุมัติแล้ว",
  REJECTED: "ถูกปฏิเสธ",
};

export const financialStatusLabel: Record<FinancialStatus, string> = {
  UNPAID: "ยังไม่ชำระ",
  PARTIAL: "ชำระบางส่วน",
  PAID: "ชำระครบ",
  OVERPAID: "ชำระเกิน",
};

export const accountStatusLabel: Record<AccountStatus, string> = {
  PENDING: "รออนุมัติ",
  ACTIVE: "ใช้งานได้",
  DISABLED: "ถูกระงับ",
};

export function adminTotals() {
  const views = obligations.map(buildObligationView);
  return {
    collections: collections.filter((c) => c.status !== "ARCHIVED").length,
    members: profiles.filter((p) => p.role === "USER").length,
    pending: pendingPayments().length,
    required: views.reduce((s, v) => s + v.obligation.requiredAmount, 0),
    approved: views.reduce((s, v) => s + v.approved, 0),
    remaining: views.reduce((s, v) => s + v.remaining, 0),
  };
}
