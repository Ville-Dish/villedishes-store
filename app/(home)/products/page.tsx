"use client";

import { Button } from "@/components/ui/button";
import Search from "@/components/custom/search";
import { ProductCard } from "@/components/custom/product-card";

import { Rabbit } from "lucide-react";

import { Banner } from "@/components/custom/banner";

import { useEffect, useState } from "react";

const ProductPage = () => {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/menu", { method: "GET" });
        const data = await response.json();

        if (response.ok) {
          setProducts(data.data);
          setFilteredItems(data.data); // Set filtered items initially to all products
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

  const categories = ["All", ...new Set(products.map((item) => item.category))];

  useEffect(() => {
    const filtered = products.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (activeCategory === "All" || item.category === activeCategory)
    );
    setFilteredItems(filtered);
  }, [searchQuery, activeCategory, products]);

  //function to render No products
  const renderNoProductsFound = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Rabbit className="w-16 h-16 mb-4 text-gray-400" />
      <p className="text-xl font-semibold text-gray-600">No products found</p>
      {products.length > 0 ? (
        <>
          <p className="text-gray-500 mt-2 text-center">
            Try adjusting your search or filter to find what you&apos;re looking
            for.
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
          backgroundImage="https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187546/product-banner-bg_qzyrx1.png"
        />
        <section id="product-items" className="w-full py-12 md:py-24 lg:py-32">
          <div className="px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Delicious Nigerian Cuisine
            </h2>
            <div className="mb-8">
              <Search onSearch={setSearchQuery} />
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-xl font-semibold text-gray-600">
                  Loading Products...
                </p>
              </div>
            ) : products.length > 0 ? (
              filteredItems.length > 0 ? (
                <ProductCard
                  categories={categories}
                  items={filteredItems}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                />
              ) : (
                renderNoProductsFound()
              )
            ) : (
              renderNoProductsFound()
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductPage;
