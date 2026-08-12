import { notFound } from "next/navigation";
import { getPayData } from "@/lib/fundflow-repository";
import { PayForm } from "./pay-form";

export default async function PayPage({ params }: { params: Promise<{ obligationId: string }> }) {
  const { obligationId } = await params;
  const data = await getPayData(obligationId);

  if (!data) notFound();

  return <PayForm profile={data.profile} view={data.view} isDemo={data.isDemo} />;
}
