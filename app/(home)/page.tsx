"use client";

import { Banner } from "@/components/custom/banner";
import { ProductCard } from "@/components/custom/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { testimonials } from "@/lib/constantData";
import { ChefHat, Clock, Rabbit, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

//function to render No products
const RenderNoProductsFound = ({ products }: { products: MenuItem[] }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Rabbit className="w-16 h-16 mb-4 text-gray-400" />
    <p className="text-xl font-semibold text-gray-600">No products found</p>
    {products.length > 0 ? (
      <>
        {/* <p className="text-gray-500 mt-2 text-center">
            Try adjusting your search or filter to find what you&apos;re looking for.
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setActiveCategory("All")
            }}
          >
            Clear filters
          </Button> */}
        <p className="text-gray-500 mt-2">Check back later.</p>
      </>
    ) : (
      <p className="text-gray-500 mt-2">Check back later.</p>
    )}
  </div>
);

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const categoryParam =
          activeCategory === "All" ? "" : `&category=${activeCategory}`;
        const response = await fetch(`/api/menu?limit=8${categoryParam}`, {
          method: "GET",
        });

        const data = await response.json();

        if (response.ok) {
          setFilteredItems(data.data); // Set filtered items initially to all products

          // Only update categories on first load or when we don't have them
          if (!categories.length || activeCategory === "All") {
            // Use the categories from API response
            setCategories(["All", ...data.categories]);
          }
        } else {
          console.error("Error fetching products:", data.message);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Banner
          title="Authentic Nigerian Cuisine Delivered to Your Door"
          subtitle="Experience the rich flavors of Nigeria with our delicious meals and desserts"
          ctaText="Order Now"
          ctaLink="/products"
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
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-xl font-semibold text-gray-600">
                  Loading Products...
                </p>
              </div>
            ) : loadingProducts ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredItems.length > 0 ? (
              <>
                <div className="text-center mt-12">
                  <ProductCard
                    categories={categories}
                    items={filteredItems}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                  />
                  <Button asChild className="mt-4">
                    <Link href="/products">View Full Menu</Link>
                  </Button>
                </div>
              </>
            ) : (
              <RenderNoProductsFound products={filteredItems} />
            )}
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              What Our Customers Say
            </h2>
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name}>
                  <CardContent className="pt-6">
                    <p className="mb-4 italic">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <p className="font-bold">- {testimonial.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
