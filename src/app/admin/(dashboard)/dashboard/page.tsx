//app/admin/(dashboard)/dashboard/page.tsx

import { AdminDashboard } from "@/components/custom/dashboard/admin-dashboard";
import { requireAuth } from "@/lib/session/server-session";

const AdminDashboardPage = async () => {
 await requireAuth();

  return <AdminDashboard />;
};

export default AdminDashboardPage;
