"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AccountStatus, Role } from "@/lib/fundflow-data";

async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    redirect("/admin/users");
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

  return user.id;
}

function initialsFromName(name: string) {
  const trimmed = name.trim();
  return (trimmed[0] ?? "-").toUpperCase();
}

export async function updateUserProfile(formData: FormData) {
  const currentUserId = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!userId || !name || userId === currentUserId) {
    redirect("/admin/users");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      initials: initialsFromName(name),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function setUserRole(formData: FormData) {
  const currentUserId = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as Role;

  if (!userId || userId === currentUserId || !["USER", "ADMIN"].includes(role)) {
    redirect("/admin/users");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function setUserStatus(formData: FormData) {
  const currentUserId = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const status = String(formData.get("status") ?? "") as AccountStatus;

  if (!userId || userId === currentUserId || !["PENDING", "ACTIVE", "DISABLED"].includes(status)) {
    redirect("/admin/users");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(formData: FormData) {
  const currentUserId = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");

  if (!userId || userId === currentUserId) {
    redirect("/admin/users");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) throw error;

  revalidatePath("/admin/users");
  redirect("/admin/users");
}
