"use client";

import { allProduct } from "@/lib/constantData";

import { Button } from "@/components/ui/button";
import Search from "@/components/custom/search";
import { ProductCard } from "@/components/custom/product-card";

import { Rabbit } from "lucide-react";

import { Banner } from "@/components/custom/banner";

import { useEffect, useState } from "react";

const productItems = allProduct;

const categories = [
  "All",
  ...new Set(productItems.map((item) => item.category)),
];

const ProductPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(productItems);

  useEffect(() => {
    const filtered = allProduct.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (activeCategory === "All" || item.category === activeCategory)
    );
    setFilteredItems(filtered);
  }, [searchQuery, activeCategory]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Banner
          title="Our Menu"
          subtitle="Explore our delicious Nigerian dishes"
          ctaText="Place Order"
          ctaLink="#product-items"
          backgroundImage="/assets/product-banner-bg.png"
        />
        <section id="product-items" className="w-full py-12 md:py-24 lg:py-32">
          <div className="px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Delicious Nigerian Cuisine
            </h2>
            <div className="mb-8">
              <Search onSearch={setSearchQuery} />
            </div>
            {filteredItems.length > 0 ? (
              <ProductCard
                categories={categories}
                items={filteredItems}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Rabbit className="w-16 h-16 mb-4 text-gray-400" />
                <p className="text-xl font-semibold text-gray-600">
                  No products found
                </p>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search or filter to find what you&apos;re
                  looking for.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductPage;
