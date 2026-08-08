import { redirect } from "next/navigation";
import { currentAdmin } from "../lib/adminAuth";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return <AdminDashboard adminEmail={admin.email} />;
}
