import { InvoiceList } from "@/features/invoices/components/invoices/invoice-list";
import { invoicesParamsLoader } from "@/features/invoices/params-loader";
import { requireAuth } from "@/lib/session/server-session";
import { prefetch, trpc } from "@/trpc/server";
import { SearchParams } from "nuqs/server";

type Props = {
  searchParams: Promise<SearchParams>;
};

const AdminInvoicesPage = async ({ searchParams }: Props) => {
  await requireAuth();
  const params = await invoicesParamsLoader(searchParams);
  prefetch(trpc.products.getCategories.queryOptions());
  // prefetch(trpc.invoices.getPaginatedInvoices.queryOptions(params));

  return <InvoiceList />;
};
export default AdminInvoicesPage;
