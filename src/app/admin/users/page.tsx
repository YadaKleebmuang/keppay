import { getAdminData } from "@/lib/fundflow-repository";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  const data = await getAdminData();

  return <UsersClient data={data} />;
}
