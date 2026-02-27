import { OrderList } from "@/features/orders/components/order-list";
import { ordersParamsLoader } from "@/features/orders/params-loader";
import { requireAuth } from "@/lib/session/server-session";
import { SearchParams } from "nuqs/server";

type Props = {
  searchParams: Promise<SearchParams>;
};

const AdminOrdersPage = async ({ searchParams }: Props) => {
  await requireAuth();
  const params = await ordersParamsLoader(searchParams);
  return <OrderList />;
};

export default AdminOrdersPage;
