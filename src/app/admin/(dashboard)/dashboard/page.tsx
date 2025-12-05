//app/admin/(dashboard)/dashboard/page.tsx

import { AdminDashboard } from "@/components/custom/dashboard/admin-dashboard";
import { getAuthSession } from "@/lib/session/server-session";

const AdminDashboardPage = async () => {
  await getAuthSession();

  return <AdminDashboard />;
};

export default AdminDashboardPage;
