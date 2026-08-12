"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AccountStatus, CollectionStatus, Role } from "@/lib/fundflow-data";

async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    redirect("/admin/collections");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", user.id)
    .single<{ role: Role; status: AccountStatus }>();

  if (error || !profile || profile.role !== "ADMIN" || profile.status !== "ACTIVE") {
    redirect("/dashboard");
  }

  return { supabase, user };
}

export async function createCollection(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const memberIds = formData.getAll("memberIds").map(String);

  if (!title || amount <= 0 || memberIds.length === 0) {
    throw new Error("กรุณากรอกชื่อรายการ ยอดต่อคน และเลือกสมาชิกอย่างน้อย 1 คน");
  }

  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .insert({
      title,
      description,
      status: "OPEN",
      created_by: user.id,
      due_date: dueDate || null,
    })
    .select("id")
    .single<{ id: string }>();

  if (collectionError || !collection) throw collectionError;

  const { error: obligationError } = await supabase.from("obligations").insert(
    memberIds.map((memberId) => ({
      collection_id: collection.id,
      user_id: memberId,
      required_amount: amount,
    })),
  );

  if (obligationError) throw obligationError;

  revalidatePath("/admin/collections");
  revalidatePath("/admin");
  redirect(`/admin/collections/${collection.id}`);
}

export async function updateCollection(formData: FormData) {
  const { supabase } = await requireAdmin();
  const collectionId = String(formData.get("collectionId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "");
  const status = String(formData.get("status") ?? "") as CollectionStatus;

  if (!collectionId || !title || !["DRAFT", "OPEN", "CLOSED", "ARCHIVED"].includes(status)) {
    throw new Error("ข้อมูลรายการไม่ครบ");
  }

  const { error } = await supabase
    .from("collections")
    .update({
      title,
      description,
      status,
      due_date: dueDate || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", collectionId);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/admin/collections");
  revalidatePath(`/admin/collections/${collectionId}`);
  redirect(`/admin/collections/${collectionId}`);
}

export async function deleteCollection(formData: FormData) {
  const { supabase } = await requireAdmin();
  const collectionId = String(formData.get("collectionId") ?? "");

  if (!collectionId) {
    throw new Error("ไม่พบรายการที่ต้องการลบ");
  }

  const { error } = await supabase.from("collections").delete().eq("id", collectionId);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/admin/collections");
  redirect("/admin/collections");
}

export async function addCollectionMember(formData: FormData) {
  const { supabase } = await requireAdmin();
  const collectionId = String(formData.get("collectionId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const requiredAmount = Number(formData.get("requiredAmount") ?? 0);

  if (!collectionId || !userId || requiredAmount <= 0) {
    throw new Error("กรุณาเลือกสมาชิกและกรอกยอดที่ต้องชำระ");
  }

  const { error } = await supabase.from("obligations").insert({
    collection_id: collectionId,
    user_id: userId,
    required_amount: requiredAmount,
  });

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/admin/collections");
  revalidatePath(`/admin/collections/${collectionId}`);
  redirect(`/admin/collections/${collectionId}`);
}

export async function updateCollectionMember(formData: FormData) {
  const { supabase } = await requireAdmin();
  const collectionId = String(formData.get("collectionId") ?? "");
  const obligationId = String(formData.get("obligationId") ?? "");
  const requiredAmount = Number(formData.get("requiredAmount") ?? 0);

  if (!collectionId || !obligationId || requiredAmount < 0) {
    throw new Error("กรุณากรอกยอดที่ต้องชำระ");
  }

  const { error } = await supabase
    .from("obligations")
    .update({ required_amount: requiredAmount })
    .eq("id", obligationId);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/admin/collections");
  revalidatePath(`/admin/collections/${collectionId}`);
  redirect(`/admin/collections/${collectionId}`);
}

export async function deleteCollectionMember(formData: FormData) {
  const { supabase } = await requireAdmin();
  const collectionId = String(formData.get("collectionId") ?? "");
  const obligationId = String(formData.get("obligationId") ?? "");

  if (!collectionId || !obligationId) {
    throw new Error("ไม่พบสมาชิกที่ต้องการลบออกจากรายการ");
  }

  const { error } = await supabase.from("obligations").delete().eq("id", obligationId);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/admin/collections");
  revalidatePath(`/admin/collections/${collectionId}`);
  redirect(`/admin/collections/${collectionId}`);
}
