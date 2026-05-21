import { HomeView } from "@/components/custom/public-view/home-view";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { productsParamsLoader } from "@/features/products/params-loader";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";

type Props = {
  searchParams: Promise<SearchParams>;
};

const Home = async ({ searchParams }: Props) => {
  const params = await productsParamsLoader(searchParams);

  prefetch(trpc.testimonials.getTestimonials.queryOptions());

  prefetch(trpc.products.getPaginatedProducts.queryOptions(params));

  return (
    <HydrateClient>
      <ErrorBoundary>
        <HomeView />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Home;
