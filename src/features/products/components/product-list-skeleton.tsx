import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ProductListSkeletonRow = () => {
  return (
    <TableRow>
      {/* S/N */}
      <TableCell>
        <Skeleton className="h-4 w-6" />
      </TableCell>

      {/* Name */}
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>

      {/* Price */}
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>

      {/* Category */}
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>

      {/* Rating */}
      <TableCell>
        <Skeleton className="h-4 w-14" />
      </TableCell>

      {/* Actions */}
      <TableCell>
        <Skeleton className="size-7 rounded-md" />
      </TableCell>
    </TableRow>
  );
};

export const ProductListSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>S/N</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: count }).map((_, index) => (
            <ProductListSkeletonRow key={index} />
          ))}
        </TableBody>
      </Table>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-4 py-4 border-t">
        {/* "Showing X to Y of Z entries" */}
        <Skeleton className="h-4 w-48" />

        {/* Pagination buttons */}
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-14 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  );
};
