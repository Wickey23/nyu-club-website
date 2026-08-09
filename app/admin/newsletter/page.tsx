import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import NewsletterAdmin from "./NewsletterAdmin";

export default async function NewsletterPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", user.id).single();
  if (!profile || profile.status === "disabled" || !["super_admin","admin"].includes(profile.role)) redirect("/admin");

  return <NewsletterAdmin />;
}
