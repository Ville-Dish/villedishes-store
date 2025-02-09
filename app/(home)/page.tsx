"use client";

import { Banner } from "@/components/custom/banner";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, Truck } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { testimonials } from "@/lib/constantData";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/custom/product-card";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [popularProducts, setPopularProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/menu?limit=8", { method: "GET" });
        const data = await response.json();

        if (response.ok) {
          setPopularProducts(data.data);
          // setFilteredItems(data.data); // Set filtered items initially to all products
        } else {
          console.error("Error fetching products:", data.message);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    "All",
    ...new Set(popularProducts.map((item) => item.category)),
  ];

  useEffect(() => {
    const filtered = popularProducts.filter(
      (item) => activeCategory === "All" || item.category === activeCategory
    );
    setFilteredItems(filtered);
  }, [activeCategory, popularProducts]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Banner
          title="Authentic Nigerian Cuisine Delivered to Your Door"
          subtitle="Experience the rich flavors of Nigeria with our delicious meals and desserts"
          ctaText="Order Now"
          ctaLink="/products"
          backgroundImage="https://res.cloudinary.com/dxt7vk5dg/image/upload/v1737565949/banner-bg_do18g3.png"
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
            ) : filteredItems.length > 0 ? (
              <ProductCard
                categories={categories}
                items={filteredItems}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            ) : (
              <div className="flex justify-center items-center h-64"></div>
            )}
            <div className="text-center mt-12">
              <Button asChild>
                <Link href="/products">View Full Menu</Link>
              </Button>
            </div>
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
