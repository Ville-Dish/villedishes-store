import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export const ProductCardSkeleton = () => {
  return (
    <Card className="flex flex-col justify-between overflow-hidden h-62.5 w-full md:w-61.25">
      {/* Image skeleton */}
      <Skeleton className="w-full h-30" />

      {/* Title skeleton */}
      <CardHeader className="p-2">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>

      {/* Description and rating skeleton */}
      <CardContent className="p-2 pt-0 grow space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-20 mt-1" />
      </CardContent>

      {/* Price and button skeleton */}
      <CardFooter className="p-2 flex justify-between items-center">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="size-9 rounded-md" />
      </CardFooter>
    </Card>
  );
};

export const ProductCardSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
