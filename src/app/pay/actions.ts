"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function submitSlip(formData: FormData) {
  const obligationId = String(formData.get("obligationId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const slips = formData.getAll("slip");

  const validSlips = slips.filter(
    (slip): slip is File => slip instanceof File && slip.size > 0
  );

  if (!obligationId || !amount || validSlips.length === 0) {
    throw new Error("กรุณาเลือกสลิปและกรอกจำนวนเงินให้ครบ");
  }

  if (!isSupabaseConfigured()) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/");
  }

  const amountPerSlip = amount / validSlips.length;

  for (const slip of validSlips) {
    const bytes = Buffer.from(await slip.arrayBuffer());
    const slipHash = createHash("sha256").update(bytes).digest("hex");
    const extension = slip.name.split(".").pop()?.toLowerCase() || "webp";
    const path = `${user.id}/${obligationId}/${Date.now()}-${slipHash.slice(0, 12)}.${extension}`;

    const { error: uploadError } = await supabase.storage.from("slips").upload(path, bytes, {
      contentType: slip.type || "application/octet-stream",
      upsert: false,
    });

    if (uploadError) {
      throw uploadError;
    }

    const { error: insertError } = await supabase.from("payments").insert({
      obligation_id: obligationId,
      submitted_by: user.id,
      amount_entered: amountPerSlip,
      status: "PENDING",
      bank: null,
      slip_path: path,
      slip_hash: slipHash,
      qr_detected: false,
    });

    if (insertError) {
      throw insertError;
    }
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
