import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProductList } from "@/features/products/components/product-list";
import { productsParamsLoader } from "@/features/products/params-loader";
import { requireAuth } from "@/lib/session/server-session";
import { HydrateClient, trpc, prefetch } from "@/trpc/server";
import { SearchParams } from "nuqs/server";

type Props = {
  searchParams: Promise<SearchParams>;
};
const AdminProductsPage = async ({ searchParams }: Props) => {
  await requireAuth();
  const params = await productsParamsLoader(searchParams);
  prefetch(trpc.products.getPaginatedProducts.queryOptions(params));

  return (
    <HydrateClient>
      <ErrorBoundary>
        <ProductList />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default AdminProductsPage;
