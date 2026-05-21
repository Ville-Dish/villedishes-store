"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ChefHat, Clock, Rabbit, Truck } from "lucide-react";
import Link from "next/link";

import { Banner } from "@/components/custom/banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useProductsParams } from "@/features/products/hooks/use-products-params";
import { useTRPC } from "@/trpc/client";
import { Suspense } from "react";
import { ProductCardSkeletonGrid } from "@/features/products/components/product-card-skeleton";
import { ProductCard } from "@/features/products/components/product-card";

//function to render No products
const RenderNoProductsFound = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <Rabbit className="w-16 h-16 mb-4 text-gray-400" />
    <p className="text-xl font-semibold text-gray-600">No products found</p>
    <p className="text-gray-500 mt-2">Check back later.</p>
  </div>
);

export const HomeView = () => {
  const trpc = useTRPC();
  const [params, setParams] = useProductsParams();
  const activeCategory = params.category || "ALL";

  // Fetch products using tRPC
  const { data: productsData, isLoading: loadingProducts } = useSuspenseQuery(
    trpc.products.getPaginatedProducts.queryOptions({
      category: activeCategory,
      page: 1,
      pageSize: 6,
    }),
  );

  // Fetch testimonials using tRPC
  const { data: testimonials, isLoading: loadingTestimonials } =
    useSuspenseQuery(trpc.testimonials.getTestimonials.queryOptions());

  const categories = ["ALL", ...(productsData?.categories || [])];
  const filteredItems = productsData?.products || [];

  const handleCategoryChange = (category: string) => {
    setParams({
      ...params,
      category,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Banner
          title="Authentic Nigerian Cuisine Delivered to Your Door"
          subtitle="Experience the rich flavors of Nigeria with our delicious meals and desserts"
          ctaText="Order Now"
          ctaLink="/products"
          extraCtaText="Catering Services"
          extraCtaLink="/catering"
          backgroundImage="https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187545/banner-bg_zsu5gn.png"
        />
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container mx-auto grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-12 px-4 md:px-6">
            <Card>
              <CardHeader>
                <ChefHat className="h-10 w-10 mb-2 text-yellow-500" />
                <CardTitle>Authentic Recipes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Our chefs use traditional Nigerian recipes passed down through
                  generations.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 mb-2 text-yellow-500" />
                <CardTitle>Fresh Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  We source the freshest ingredients to ensure the best quality
                  and taste.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Truck className="h-10 w-10 mb-2 text-yellow-500" />
                <CardTitle>Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Enjoy your favorite Nigerian dishes delivered hot and fresh to
                  your doorstep.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
        <section id="menu" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Our Popular Menu
            </h2>
            {loadingProducts ? (
              <ProductCardSkeletonGrid count={6} />
            ) : filteredItems.length > 0 ? (
              <>
                <div className="text-center mt-12">
                  <Suspense fallback={<ProductCardSkeletonGrid count={6} />}>
                    <ProductCard
                      categories={categories}
                      items={filteredItems}
                      activeCategory={activeCategory}
                      onCategoryChange={handleCategoryChange}
                      showPagination={false}
                    />
                  </Suspense>
                  <Button asChild className="mt-4">
                    <Link href="/products">View Full Menu</Link>
                  </Button>
                </div>
              </>
            ) : (
              <RenderNoProductsFound />
            )}
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              What Our Customers Say
            </h2>
            <Suspense>
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id}>
                    <CardContent className="pt-6">
                      <p className="mb-4 italic">
                        &quot;{testimonial.comment}&quot;
                      </p>
                      <p className="font-bold">- {testimonial.authorName}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Suspense>
          </div>
        </section>
      </main>
    </div>
  );
};
