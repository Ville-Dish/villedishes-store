import { OrderList } from "@/components/custom/orders/order-list";
import { requireAuth } from "@/lib/session/server-session";

const AdminOrdersPage = async () => {
  await requireAuth();
  return <OrderList />;
};

export default AdminOrdersPage;
