"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { revalidatePath } from "next/cache";

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw error;
  }

  redirect(data.url);
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}

export async function updateProfileName(name: string) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("ชื่อห้ามว่าง");
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("ไม่ได้เข้าสู่ระบบ");
    }

    const adminClient = createSupabaseAdminClient();
    const initials = trimmedName.charAt(0).toUpperCase();

    const { error } = await adminClient
      .from("profiles")
      .update({
        name: trimmedName,
        initials: initials,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      throw error;
    }
  }

  revalidatePath("/", "layout");
}

