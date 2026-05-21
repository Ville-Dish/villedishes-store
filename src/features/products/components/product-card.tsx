import { blurDataUrl } from "@/lib/utils";
import useCartStore from "@/stores/useCartStore";
import {
  ChevronLeft,
  ChevronRight,
  Loader,
  ShoppingBasket,
  Minus,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RatingReview from "@/components/custom/rating-review";
import { MenuItem } from "@/lib/types";

type ProductTabsProps = {
  categories: string[];
  items: MenuItem[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
};

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  size?: "sm" | "md" | "lg";
}

export const ProductCard = ({
  categories,
  items,
  activeCategory,
  onCategoryChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPagination = true,
}: ProductTabsProps) => {
  const { addToCart, cartItems, removeFromCart, updateCartItem } =
    useCartStore();
  const [loadingItem, setLoadingItem] = useState<string | null>(null);

  const handleAddToCart = async (item: MenuItem) => {
    setLoadingItem(item.id);
    // await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
    addToCart({
      id: item.id,
      name: item.name,
      quantity: 1,
      price: item.price,
    });
    setLoadingItem(null);
  };

  const handlePageChange = (pageNumber: number) => {
    if (onPageChange) {
      onPageChange(pageNumber);
      // Scroll to top of products section
      document.getElementById("product-items")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleInCart = (id: string) => {
    return cartItems.some((item) => item.id === id);
  };

  const getCartQuantity = (id: string) => {
    const item = cartItems.find((item) => item.id === id);
    return item?.quantity || 0;
  };

  const handleIncrease = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      quantity: 1,
      price: item.price,
    });
  };

  const handleDecrease = (id: string) => {
    const currentQuantity = getCartQuantity(id);
    if (currentQuantity === 1) {
      removeFromCart(id);
    } else {
      updateCartItem(id, -1);
    }
  };

  return (
    <Tabs value={activeCategory} className="w-full">
      <TabsList className="flex justify-start mb-8 w-full h-auto flex-nowrap items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categories.map((category) => (
          <TabsTrigger
            key={category}
            value={category}
            onClick={() => onCategoryChange(category)}
            className="px-4 py-2 m-1"
          >
            {category}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeCategory} className="mt-0">
        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item, index) => (
            <Card
              key={item.id}
              className="flex flex-col justify-between overflow-hidden h-62.5 w-full md:w-61.25"
            >
              <div className="relative w-full h-30">
                <Image
                  src={
                    item.image ||
                    "https://img.icons8.com/cute-clipart/64/no-image.png"
                  }
                  alt={item.name || "No image"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  priority={index < 4}
                  placeholder="blur"
                  blurDataURL={blurDataUrl}
                  className="absolute top-0 left-0 size-full object-cover"
                />
              </div>
              <CardHeader className="p-2">
                <CardTitle className="text-lg truncate">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 grow">
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
                {loadingItem === item.id ? (
                  <div className="flex items-center justify-center size-9">
                    <Loader className="animate-spin size-5" />
                  </div>
                ) : handleInCart(item.id) ? (
                  <QuantityControl
                    quantity={getCartQuantity(item.id)}
                    onIncrease={() => handleIncrease(item)}
                    onDecrease={() => handleDecrease(item.id)}
                    size="sm"
                  />
                ) : (
                  <Button
                    size="sm"
                    className="bg-[#fe9e1d]"
                    onClick={() => handleAddToCart(item)}
                    disabled={loadingItem === item.id}
                  >
                    <ShoppingBasket className="text-[#fff1e2]" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {showPagination && totalPages > 1 && (
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

            {getPaginatedPages(currentPage, totalPages, 5).map((page, index) =>
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
              ),
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
      </TabsContent>
    </Tabs>
  );
};

const getPaginatedPages = (
  current: number,
  total: number,
  windowSize: number,
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

const QuantityControl = ({
  quantity,
  onIncrease,
  onDecrease,
  size = "sm",
}: QuantityControlProps) => {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  const buttonSize = sizeClasses[size];

  return (
    <div className="flex items-center gap-1 bg-[#fe9e1d] rounded-md p-0.5">
      <Button
        size="icon"
        variant="ghost"
        className={`${buttonSize} hover:bg-[#e68d1a] text-white cursor-pointer`}
        onClick={onDecrease}
      >
        <Minus className="size-3" />
      </Button>
      <span className="min-w-6 text-center text-sm font-semibold text-white">
        {quantity}
      </span>
      <Button
        size="icon"
        variant="ghost"
        className={`${buttonSize} hover:bg-[#e68d1a] text-white cursor-pointer`}
        onClick={onIncrease}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
};
