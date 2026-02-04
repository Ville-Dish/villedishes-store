import { OrderList } from "@/components/custom/orders/order-list";
import { getAuthSession } from "@/lib/session/server-session";

const AdminOrdersPage = async () => {
  await getAuthSession();
  return <OrderList />;
};

export default AdminOrdersPage;
