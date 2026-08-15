import { getAdminData } from "@/lib/fundflow-repository";
import { CollectionDetailClient } from "./collection-detail-client";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  const data = await getAdminData();

  return <CollectionDetailClient collectionId={collectionId} data={data} />;
}
