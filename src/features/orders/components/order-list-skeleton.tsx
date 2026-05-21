import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OrderListSkeletonRow = () => {
  return (
    <TableRow>
      {/* S/N */}
      <TableCell>
        <Skeleton className="h-4 w-6" />
      </TableCell>

      {/* Order No. */}
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>

      {/* Order Date */}
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>

      {/* Customer */}
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>

      {/* Total */}
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>

      {/* Status badge */}
      <TableCell>
        <Skeleton className="h-7 w-24 rounded-md" />
      </TableCell>

      {/* Action (status select) */}
      <TableCell>
        <Skeleton className="h-9 w-45 rounded-md" />
      </TableCell>

      {/* Details (eye button) */}
      <TableCell>
        <Skeleton className="size-8 rounded-md" />
      </TableCell>
    </TableRow>
  );
};

export const OrderListSkeleton = ({ count = 10 }: { count?: number }) => {
  return (
    <>
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S/N</TableHead>
              <TableHead>Order No.</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: count }).map((_, index) => (
              <OrderListSkeletonRow key={index} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-14 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </>
  );
};
