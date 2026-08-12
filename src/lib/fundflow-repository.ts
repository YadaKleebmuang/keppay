import { redirect } from "next/navigation";
import {
  adminTotals,
  collections,
  currentUser,
  obligationById,
  obligations,
  obligationViewsForUser,
  payments,
  profiles,
  type Collection,
  type CollectionStatus,
  type Obligation,
  type ObligationView,
  type Payment,
  type PaymentStatus,
  type Profile,
} from "@/lib/fundflow-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DbProfile = {
  id: string;
  name: string;
  email: string;
  role: Profile["role"];
  status: Profile["status"];
  initials: string;
};

type DbObligation = {
  id: string;
  collection_id: string;
  user_id: string;
  required_amount: string | number;
  collections: {
    id: string;
    title: string;
    description: string;
    status: Collection["status"];
    created_at: string;
    due_date: string | null;
  } | null;
  payments: Array<{
    id: string;
    obligation_id: string;
    amount_entered: string | number;
    approved_amount: string | number | null;
    status: Payment["status"];
    created_at: string;
    reviewed_at: string | null;
    reject_reason: string | null;
    ocr_amount: string | number | null;
    qr_detected: boolean;
    slip_hash: string;
    bank: string | null;
  }>;
};

type DbCollection = {
  id: string;
  title: string;
  description: string;
  status: CollectionStatus;
  created_by: string;
  due_date: string | null;
  created_at: string;
};

type DbPayment = {
  id: string;
  obligation_id: string;
  submitted_by: string;
  amount_entered: string | number;
  approved_amount: string | number | null;
  status: PaymentStatus;
  bank: string | null;
  slip_path: string;
  slip_hash: string;
  ocr_amount: string | number | null;
  qr_detected: boolean;
  reject_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
};

type DbObligationFlat = {
  id: string;
  collection_id: string;
  user_id: string;
  required_amount: string | number;
};

export type DashboardData = {
  profile: Profile;
  views: ObligationView[];
  isDemo: boolean;
};

export type PayData = {
  profile: Profile;
  view: ObligationView;
  isDemo: boolean;
};

export type AdminData = {
  profile: Profile;
  collections: Collection[];
  profiles: Profile[];
  obligations: Obligation[];
  payments: Payment[];
  views: ObligationView[];
  isDemo: boolean;
};

const money = (value: string | number | null | undefined) => Number(value ?? 0);
const dateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" }) : "";

function mapProfile(row: DbProfile): Profile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    initials: row.initials,
  };
}

function mapCollection(row: DbCollection): Collection {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.created_at.slice(0, 10),
    ...(row.due_date ? { dueDate: row.due_date } : {}),
  };
}

function mapObligation(row: DbObligationFlat): Obligation {
  return {
    id: row.id,
    collectionId: row.collection_id,
    userId: row.user_id,
    requiredAmount: money(row.required_amount),
  };
}

function mapPayment(row: DbPayment): Payment {
  return {
    id: row.id,
    obligationId: row.obligation_id,
    amountEntered: money(row.amount_entered),
    ...(row.approved_amount !== null ? { approvedAmount: money(row.approved_amount) } : {}),
    status: row.status,
    submittedAt: dateTime(row.created_at),
    ...(row.reviewed_at ? { reviewedAt: dateTime(row.reviewed_at) } : {}),
    ...(row.reject_reason ? { rejectReason: row.reject_reason } : {}),
    ...(row.ocr_amount !== null ? { ocrAmount: money(row.ocr_amount) } : {}),
    qrDetected: row.qr_detected,
    slipHash: row.slip_hash,
    slipPath: row.slip_path,
    bank: row.bank ?? "-",
  };
}

function buildViewFromDb(row: DbObligation, profile: Profile): ObligationView | null {
  if (!row.collections) return null;

  const obligation: Obligation = {
    id: row.id,
    collectionId: row.collection_id,
    userId: row.user_id,
    requiredAmount: money(row.required_amount),
  };

  const collection: Collection = {
    id: row.collections.id,
    title: row.collections.title,
    description: row.collections.description,
    status: row.collections.status,
    createdAt: row.collections.created_at.slice(0, 10),
    ...(row.collections.due_date ? { dueDate: row.collections.due_date } : {}),
  };

  const payments: Payment[] = row.payments.map((payment) => ({
    id: payment.id,
    obligationId: payment.obligation_id,
    amountEntered: money(payment.amount_entered),
    ...(payment.approved_amount !== null ? { approvedAmount: money(payment.approved_amount) } : {}),
    status: payment.status,
    submittedAt: dateTime(payment.created_at),
    ...(payment.reviewed_at ? { reviewedAt: dateTime(payment.reviewed_at) } : {}),
    ...(payment.reject_reason ? { rejectReason: payment.reject_reason } : {}),
    ...(payment.ocr_amount !== null ? { ocrAmount: money(payment.ocr_amount) } : {}),
    qrDetected: payment.qr_detected,
    slipHash: payment.slip_hash,
    bank: payment.bank ?? "-",
  }));

  return buildObligationViewWithRelations(obligation, collection, profile, payments);
}

function buildObligationViewWithRelations(
  obligation: Obligation,
  collection: Collection,
  member: Profile,
  payments: Payment[],
): ObligationView {
  const approved = payments
    .filter((p) => p.status === "APPROVED")
    .reduce((sum, p) => sum + (p.approvedAmount ?? 0), 0);
  const pending = payments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amountEntered, 0);
  const remaining = Math.max(obligation.requiredAmount - approved, 0);

  return {
    obligation,
    collection,
    member,
    approved,
    pending,
    remaining,
    status:
      approved > obligation.requiredAmount
        ? "OVERPAID"
        : approved === obligation.requiredAmount
          ? "PAID"
          : approved > 0
            ? "PARTIAL"
            : "UNPAID",
    payments,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!isSupabaseConfigured()) {
    return {
      profile: currentUser,
      views: obligationViewsForUser(currentUser.id),
      isDemo: true,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,name,email,role,status,initials")
    .eq("id", user.id)
    .single<DbProfile>();

  if (profileError || !profile) {
    redirect("/pending");
  }

  if (profile.status === "PENDING") redirect("/pending");
  if (profile.status === "DISABLED") redirect("/disabled");

  const mappedProfile = mapProfile(profile);
  const { data, error } = await supabase
    .from("obligations")
    .select(
      `
        id,
        collection_id,
        user_id,
        required_amount,
        collections (
          id,
          title,
          description,
          status,
          created_at,
          due_date
        ),
        payments (
          id,
          obligation_id,
          amount_entered,
          approved_amount,
          status,
          created_at,
          reviewed_at,
          reject_reason,
          ocr_amount,
          qr_detected,
          slip_hash,
          bank
        )
      `,
    )
    .eq("user_id", user.id)
    .order("created_at", { referencedTable: "payments", ascending: false })
    .returns<DbObligation[]>();

  if (error) {
    throw error;
  }

  return {
    profile: mappedProfile,
    views: (data ?? [])
      .map((row) => buildViewFromDb(row, mappedProfile))
      .filter((view): view is ObligationView => Boolean(view)),
    isDemo: false,
  };
}

async function getActiveProfile(): Promise<Profile> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,name,email,role,status,initials")
    .eq("id", user.id)
    .single<DbProfile>();

  if (error || !profile) redirect("/pending");
  if (profile.status === "PENDING") redirect("/pending");
  if (profile.status === "DISABLED") redirect("/disabled");

  return mapProfile(profile);
}

async function getActiveAdminProfile(): Promise<Profile> {
  const profile = await getActiveProfile();

  if (profile.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return profile;
}

function buildViews(
  obligationRows: Obligation[],
  collectionRows: Collection[],
  profileRows: Profile[],
  paymentRows: Payment[],
) {
  return obligationRows
    .map((obligation) => {
      const collection = collectionRows.find((row) => row.id === obligation.collectionId);
      const member = profileRows.find((row) => row.id === obligation.userId);
      if (!collection || !member) return null;

      return buildObligationViewWithRelations(
        obligation,
        collection,
        member,
        paymentRows.filter((payment) => payment.obligationId === obligation.id),
      );
    })
    .filter((view): view is ObligationView => Boolean(view));
}

export async function getAdminData(): Promise<AdminData> {
  if (!isSupabaseConfigured()) {
    const views = obligations.map((obligation) => {
      const collection = collections.find((row) => row.id === obligation.collectionId)!;
      const member = profiles.find((row) => row.id === obligation.userId)!;
      return buildObligationViewWithRelations(
        obligation,
        collection,
        member,
        payments.filter((payment) => payment.obligationId === obligation.id),
      );
    });

    return {
      profile: profiles.find((profile) => profile.role === "ADMIN")!,
      collections,
      profiles,
      obligations,
      payments,
      views,
      isDemo: true,
    };
  }

  const profile = await getActiveAdminProfile();
  const supabase = await createSupabaseServerClient();
  const [profilesResult, collectionsResult, obligationsResult, paymentsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,name,email,role,status,initials")
      .order("created_at", { ascending: false })
      .returns<DbProfile[]>(),
    supabase
      .from("collections")
      .select("id,title,description,status,created_by,due_date,created_at")
      .order("created_at", { ascending: false })
      .returns<DbCollection[]>(),
    supabase
      .from("obligations")
      .select("id,collection_id,user_id,required_amount")
      .returns<DbObligationFlat[]>(),
    supabase
      .from("payments")
      .select(
        "id,obligation_id,submitted_by,amount_entered,approved_amount,status,bank,slip_path,slip_hash,ocr_amount,qr_detected,reject_reason,reviewed_at,created_at",
      )
      .order("created_at", { ascending: false })
      .returns<DbPayment[]>(),
  ]);

  if (profilesResult.error) throw profilesResult.error;
  if (collectionsResult.error) throw collectionsResult.error;
  if (obligationsResult.error) throw obligationsResult.error;
  if (paymentsResult.error) throw paymentsResult.error;

  const mappedProfiles = (profilesResult.data ?? []).map(mapProfile);
  const mappedCollections = (collectionsResult.data ?? []).map(mapCollection);
  const mappedObligations = (obligationsResult.data ?? []).map(mapObligation);
  const mappedPayments = (paymentsResult.data ?? []).map(mapPayment);

  return {
    profile,
    collections: mappedCollections,
    profiles: mappedProfiles,
    obligations: mappedObligations,
    payments: mappedPayments,
    views: buildViews(mappedObligations, mappedCollections, mappedProfiles, mappedPayments),
    isDemo: false,
  };
}

export function totalsFromViews(data: AdminData) {
  if (data.isDemo) return adminTotals();

  return {
    collections: data.collections.filter((collection) => collection.status !== "ARCHIVED").length,
    members: data.profiles.filter((profile) => profile.role === "USER").length,
    pending: data.payments.filter((payment) => payment.status === "PENDING").length,
    required: data.views.reduce((sum, view) => sum + view.obligation.requiredAmount, 0),
    approved: data.views.reduce((sum, view) => sum + view.approved, 0),
    remaining: data.views.reduce((sum, view) => sum + view.remaining, 0),
  };
}

export async function getPayData(obligationId: string): Promise<PayData | null> {
  if (!isSupabaseConfigured()) {
    const obligation = obligationById(obligationId);

    return obligation
      ? {
          profile: currentUser,
          view: obligationViewsForUser(currentUser.id).find(
            (view) => view.obligation.id === obligation.id,
          )!,
          isDemo: true,
        }
      : null;
  }

  const profile = await getActiveProfile();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("obligations")
    .select(
      `
        id,
        collection_id,
        user_id,
        required_amount,
        collections (
          id,
          title,
          description,
          status,
          created_at,
          due_date
        ),
        payments (
          id,
          obligation_id,
          amount_entered,
          approved_amount,
          status,
          created_at,
          reviewed_at,
          reject_reason,
          ocr_amount,
          qr_detected,
          slip_hash,
          bank
        )
      `,
    )
    .eq("id", obligationId)
    .single<DbObligation>();

  if (error || !data) return null;

  const view = buildViewFromDb(data, profile);

  return view
    ? {
        profile,
        view,
        isDemo: false,
      }
    : null;
}
