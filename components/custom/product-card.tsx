import { useSearchParams } from "@/hooks/use-search-params";
import useCartStore from "@/stores/useCartStore";
import {
  ChevronLeft,
  ChevronRight,
  Loader,
  ShoppingBasket,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import RatingReview from "./rating-review";

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
  const measureRef = useRef<HTMLDivElement | null>(null);

  const [params, setParams] = useSearchParams();
  const { addToCart } = useCartStore();
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  // const itemsPerPage = isLargeScreen ? 12 : 5;
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(params.page);
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResize = useCallback(() => {
    setIsLargeScreen(window.innerWidth > 768);
  }, []);

  const calculateItemsPerPage = useCallback(() => {
    const grid = measureRef.current;
    if (!grid) return;

    // Compute how many columns exist (CSS sets this automatically)
    const computed = window.getComputedStyle(grid);
    const columnCount = computed.gridTemplateColumns.split(" ").length;

    // Automatically compute rows based on screen height
    const rowHeight = 250 + 24; // card height + gaps
    const rows = Math.floor(window.innerHeight / rowHeight);

    const newItemsPerPage = Math.max(columnCount * rows, columnCount); // fallback
    setItemsPerPage(newItemsPerPage);
  }, []);

  useEffect(() => {
    calculateItemsPerPage();
    window.addEventListener("resize", calculateItemsPerPage);

    return () => window.removeEventListener("resize", calculateItemsPerPage);
  }, [calculateItemsPerPage]);

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
    setParams({
      ...params,
      page: pageNumber,
    });
  };

  useEffect(() => {
    setCurrentPage(params.page);
  }, [params.page]);

  useEffect(() => {
    setIsChanging(true);
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsChanging(false);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeCategory, items]);

  useEffect(() => {
    setCurrentPage(params.page);
  }, [params.page]);

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
          <div className="relative w-full overflow-hidden mt-4">
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
        <div
          ref={measureRef}
          className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 invisible absolute pointer-events-none"
        >
          <div className="h-4"></div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div
              className={`grid gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 transition-opacity duration-300 ease-in-out ${isChanging ? "opacity-0" : "opacity-100"}`}
            >
              {currentItems.map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col justify-between overflow-hidden h-[250px] w-full md:w-[245px]"
                >
                  <div className="relative w-full h-[120px]">
                    <Image
                      src={
                        item.image ||
                        "https://img.icons8.com/cute-clipart/64/no-image.png"
                      }
                      alt={item.name || "No image"}
                      fill
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="p-2">
                    <CardTitle className="text-lg truncate">
                      {item.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 pt-0 flex-grow">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="mt-1">
                      <RatingReview
                        rating={item.rating || 0}
                        reviewCount={item.reviews?.length || 0}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="p-2 flex justify-between items-center">
                    <span className="font-bold">${item.price.toFixed(2)}</span>
                    <Button
                      size="sm"
                      className="bg-[#fe9e1d]"
                      onClick={() => handleAddToCart(item)}
                      disabled={loadingItem === item.id}
                    >
                      {loadingItem === item.id ? (
                        <Loader className="animate-spin" />
                      ) : (
                        <ShoppingBasket className="text-[#fff1e2]" />
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                {/* Previous */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Previous page</span>
                </Button>

                {getPaginatedPages(currentPage, totalPages, 5).map(
                  (page, index) =>
                    page === "ellipsis" ? (
                      <div
                        key={index}
                        className="w-8 flex justify-center items-center text-gray-500"
                      >
                        …
                      </div>
                    ) : (
                      <Button
                        key={`${page}-${index}`}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                )}

                {/* Next */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  );
};

const getPaginatedPages = (
  current: number,
  total: number,
  windowSize: number
) => {
  const pages: (number | "ellipsis")[] = [];
  const first = 1;
  const last = total;
  const totalButtons = windowSize + 2;

  // If total pages <= totalButtons, return all pages
  if (total <= totalButtons) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  pages.push(first);

  // For windowSize=5, we want 4 middle numbers when single ellipsis
  // and 3 middle numbers when double ellipsis
  const singleEllipsisCount = windowSize - 1; // 4 numbers for windowSize=5
  const doubleEllipsisCount = windowSize - 2; // 3 numbers for windowSize=5

  // Adjust thresholds to ensure current-1 and current+1 are always visible
  // Near start: show pages 2 through (singleEllipsisCount + 1)
  // Transition when current reaches position where current+1 would exceed this range
  const startThreshold = singleEllipsisCount; // page 4 for windowSize=5

  // Near end: show pages (total - singleEllipsisCount) through (total - 1)
  // Transition when current reaches position where current-1 would be below this range
  const endThreshold = total - singleEllipsisCount + 1; // page 8 for total=11, windowSize=5

  if (current <= startThreshold) {
    // Near start: [1, 2, 3, 4, 5, ellipsis, 11]
    for (let i = 2; i <= singleEllipsisCount + 1; i++) {
      pages.push(i);
    }
    pages.push("ellipsis");
  } else if (current >= endThreshold) {
    // Near end: [1, ellipsis, 7, 8, 9, 10, 11]
    pages.push("ellipsis");
    for (let i = total - singleEllipsisCount; i <= total - 1; i++) {
      pages.push(i);
    }
  } else {
    // Middle: [1, ellipsis, current-1, current, current+1, ellipsis, 11]
    pages.push("ellipsis");
    const half = Math.floor(doubleEllipsisCount / 2);
    const start = current - half;
    const end = start + doubleEllipsisCount - 1;
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    pages.push("ellipsis");
  }

  pages.push(last);
  return pages;
};
