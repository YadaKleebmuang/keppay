"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function approvePayment(formData: FormData) {
  const paymentId = String(formData.get("paymentId") ?? "");
  const approvedAmount = Number(formData.get("approvedAmount") ?? 0);

  if (!paymentId || !approvedAmount) {
    throw new Error("Missing paymentId or approved amount");
  }

  if (!isSupabaseConfigured()) {
    redirect("/admin/payments");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { error } = await supabase
    .from("payments")
    .update({
      status: "APPROVED",
      approved_amount: approvedAmount,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reject_reason: null,
    })
    .eq("id", paymentId);

  if (error) throw error;

  revalidatePath("/admin/payments");
  revalidatePath("/dashboard");
  redirect(`/admin/payments/${paymentId}`);
}

export async function rejectPayment(formData: FormData) {
  const paymentId = String(formData.get("paymentId") ?? "");
  const reason = String(formData.get("rejectReason") ?? "");

  if (!paymentId || !reason.trim()) {
    throw new Error("Missing paymentId or reject reason");
  }

  if (!isSupabaseConfigured()) {
    redirect("/admin/payments");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { error } = await supabase
    .from("payments")
    .update({
      status: "REJECTED",
      approved_amount: null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reject_reason: reason,
    })
    .eq("id", paymentId);

  if (error) throw error;

  revalidatePath("/admin/payments");
  revalidatePath("/dashboard");
  redirect(`/admin/payments/${paymentId}`);
}
