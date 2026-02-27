import { InvoiceList } from "@/components/custom/invoices/invoice-list";
import { requireAuth } from "@/lib/session/server-session";
import { prefetch, trpc } from "@/trpc/server";

const AdminInvoicesPage = async () => {
  await requireAuth();

  prefetch(trpc.products.getCategories.queryOptions());

  return <InvoiceList />;
};
export default AdminInvoicesPage;
