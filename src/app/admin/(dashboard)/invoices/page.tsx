import { InvoiceList } from "@/components/custom/invoices/invoice-list";
import { requireAuth } from "@/lib/session/server-session";

const AdminInvoicesPage = async () => {
  await requireAuth();
  return <InvoiceList />;
};
export default AdminInvoicesPage;
