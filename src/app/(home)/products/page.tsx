import { SearchParams } from "nuqs/server";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { productsParamsLoader } from "@/features/products/params-loader";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { ProductView } from "@/features/products/components/product-view";

type Props = {
  searchParams: Promise<SearchParams>;
};

const ProductPage = async ({ searchParams }: Props) => {
  const params = await productsParamsLoader(searchParams);

  prefetch(trpc.products.getPaginatedProducts.queryOptions(params));

  return (
    <HydrateClient>
      <ErrorBoundary>
        <ProductView />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default ProductPage;
