import React, { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Loader,
  ShoppingBasket,
} from "lucide-react";
import useCartStore from "@/stores/useCartStore";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

type ProductTabsProps = {
  categories: string[];
  items: MenuItem[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
};

export const ProductCard = ({
  categories,
  items,
  activeCategory,
  onCategoryChange,
}: ProductTabsProps) => {
  const { addToCart } = useCartStore();
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const itemsPerPage = isLargeScreen ? 9 : 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingItem, setLoadingItem] = useState<string | null>(null);

  const handleResize = useCallback(() => {
    setIsLargeScreen(window.innerWidth > 768);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [handleResize]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, items]);

  const handleAddToCart = async (item: MenuItem) => {
    setLoadingItem(item.id);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
    addToCart({
      id: item.id,
      name: item.name,
      quantity: 1,
      price: item.price,
    });
    setLoadingItem(null);
  };

  return (
    <Tabs defaultValue="All" className="w-full">
      <TabsList className="flex justify-center mb-8 w-full">
        {isLargeScreen &&
          categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              onClick={() => onCategoryChange(category)}
              className="px-4 py-2 m-1"
            >
              {category}
            </TabsTrigger>
          ))}

        {!isLargeScreen && (
          // <div className="relative w-full overflow-hidden">
          //   <Carousel className="w-full px-4">
          //     <CarouselContent className="justify-evenly gap-2">
          //       {categories.map((category) => (
          //         <CarouselItem
          //           key={category}
          //           className="flex-none basis-1/4"
          //         >
          //           <TabsTrigger
          //             value={category}
          //             onClick={() => onCategoryChange(category)}
          //             className="px-4 py-2 m-1 w-24 text-center"
          //           >
          //             {category}
          //           </TabsTrigger>
          //         </CarouselItem>
          //       ))}
          //     </CarouselContent>
          //     <CarouselPrevious />
          //     <CarouselNext />
          //   </Carousel>
          // </div>
          <div className="relative w-full overflow-hidden">
            <Carousel className="w-full overflow-x-scroll px-4">
              <CarouselContent className="flex justify-start gap-4">
                {categories.map((category) => (
                  <CarouselItem key={category} className="flex-none basis-1/4">
                    <TabsTrigger
                      value={category}
                      onClick={() => onCategoryChange(category)}
                      className="px-4 py-2 m-1 w-24 text-center"
                    >
                      {category}
                    </TabsTrigger>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* Carousel navigation buttons */}
              <CarouselPrevious className="absolute top-1/2 left-0 transform -translate-y-1/2">
                <Button className="p-2 bg-gray-200 rounded-full shadow">
                  <ChevronLeft />
                </Button>
              </CarouselPrevious>
              <CarouselNext className="absolute top-1/2 right-0 transform -translate-y-1/2">
                <Button className="p-2 bg-gray-200 rounded-full shadow">
                  <ChevronRight />
                </Button>
              </CarouselNext>
            </Carousel>
          </div>
        )}
      </TabsList>

      <TabsContent value={activeCategory} className="mt-0">
        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {currentItems.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col justify-between overflow-hidden h-[250px] w-full md:w-[245px]"
            >
              <div className="relative w-full h-[120px]">
                <Image
                  src={item.image}
                  alt={item.name}
                  layout="fill"
                  objectFit="cover"
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
              <CardHeader className="p-2">
                <CardTitle className="text-lg truncate">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 flex-grow">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </p>
                {/* <div className="mt-1">
                          <RatingsReviews itemId={item.id} initialRating={item.rating} initialReviews={item.reviews} />
                        </div> */}
              </CardContent>
              <CardFooter className="p-2 flex justify-between items-center">
                <span className="font-bold">${item.price}</span>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(item)}
                  disabled={loadingItem === item.id}
                >
                  {loadingItem === item.id ? (
                    <Loader className="animate-spin" />
                  ) : (
                    <ShoppingBasket />
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
