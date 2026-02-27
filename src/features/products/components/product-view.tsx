"use client";

import { Rabbit } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ProductCard } from "@/features/products/components/product-card";
import Search from "@/components/custom/search";
import { Banner } from "@/components/custom/banner";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useProductsParams } from "@/features/products/hooks/use-products-params";
import { Suspense } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { ProductCardSkeletonGrid } from "./product-card-skeleton";

export const ProductView = () => {
  const trpc = useTRPC();
  const [params, setParams] = useProductsParams();

  // Add debounced search
  const debouncedSearch = useDebounce(params.search, 500);

  // Fetch products using tRPC with all params
  const { data: productsData, isLoading } = useSuspenseQuery(
    trpc.products.getPaginatedProducts.queryOptions({
      category: params.category,
      rating: params.rating,
      search: debouncedSearch,
      page: params.page,
      pageSize: params.pageSize,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
    }),
  );

  const categories = ["ALL", ...(productsData?.categories || [])];
  const filteredItems = productsData?.products || [];

  const handleSearchChange = (value: string) => {
    setParams({
      ...params,
      search: value,
      page: 1, // Reset to page 1 on search
    });
  };

  const handleCategoryChange = (category: string) => {
    setParams({
      ...params,
      category,
      page: 1, // Reset to page 1 on category change
    });
  };

  const handlePageChange = (page: number) => {
    setParams({
      ...params,
      page,
    });
  };

  const clearFilters = () => {
    setParams({
      page: 1,
      pageSize: params.pageSize,
      search: "",
      category: "ALL",
      rating: "ALL",
      minPrice: 0,
      maxPrice: 1000,
    });
  };

  //function to render No products
  const renderNoProductsFound = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Rabbit className="w-16 h-16 mb-4 text-gray-400" />
      <p className="text-xl font-semibold text-gray-600">No products found</p>
      {productsData && productsData.totalCount > 0 ? (
        <>
          <p className="text-gray-500 mt-2 text-center">
            Try adjusting your search or filter to find what you&apos;re looking
            for.
          </p>
          <Button className="mt-4" onClick={clearFilters}>
            Clear filters
          </Button>
        </>
      ) : (
        <p className="text-gray-500 mt-2">Check back later.</p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Banner
          title="Our Menu"
          subtitle="Explore our delicious Nigerian dishes"
          ctaText="Place Order"
          ctaLink="#product-items"
          extraCtaText="Catering Services"
          extraCtaLink="/catering"
          backgroundImage="https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187546/product-banner-bg_qzyrx1.png"
        />
        <section id="product-items" className="w-full py-12 md:py-24 lg:py-32">
          <div className="px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Delicious Nigerian Cuisine
            </h2>
            <div className="mb-8">
              <Search onSearch={handleSearchChange} value={params.search} />
            </div>
            {isLoading ? (
              <ProductCardSkeletonGrid count={params.pageSize || 12} />
            ) : filteredItems.length > 0 ? (
              <Suspense
                fallback={
                  <ProductCardSkeletonGrid count={params.pageSize || 12} />
                }
              >
                <ProductCard
                  categories={categories}
                  items={filteredItems}
                  activeCategory={params.category}
                  onCategoryChange={handleCategoryChange}
                  currentPage={productsData.page}
                  totalPages={productsData.totalPages}
                  onPageChange={handlePageChange}
                  showPagination={true}
                />
              </Suspense>
            ) : (
              renderNoProductsFound()
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
