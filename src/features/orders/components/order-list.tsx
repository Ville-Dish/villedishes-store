"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import { Eye, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DatePickerWithRange } from "@/components/custom/date-range-picker";
import { cn, formatDate } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import { OrderDetailsView } from "./order-details";
import { OrderDetails, OrderInfo } from "@/lib/types";
import { OrderStatus } from "@/lib/utils";
import { OrderListSkeleton } from "./order-list-skeleton";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useOrdersParams } from "../hooks/use-orders-params";

type SortField = "orderNumber" | "customer" | "status" | "total" | null;
type SortDirection = "asc" | "desc" | null;

export const OrderList = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [params, setParams] = useOrdersParams();

  const { startDate, endDate, status, page, pageSize, search } = params;

  // Add debounced search
  const debouncedSearch = useDebounce(params.search, 500);

  // normalize dates
  const normalizedStartDate = startDate ?? undefined;
  const normalizedEndDate = endDate ?? undefined;

  // get orders
  const { data: orderData, isLoading: loadingOrders } = useSuspenseQuery(
    trpc.orders.getPaginatedOrders.queryOptions({
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      status,
      search: debouncedSearch,
      page,
      pageSize,
    }),
  );

  const orders = orderData?.orders;
  const totalCount = orderData?.totalCount || 0;
  const totalPages = orderData?.totalPages || 1;
  const hasNextPage = orderData?.hasNextPage || false;
  const hasPreviousPage = orderData?.hasPreviousPage || false;

  const [selectedOrder, setSelectedOrder] = useState<OrderInfo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // trpc
  const updateStatusMutation = useMutation(
    trpc.orders.changeOrderStatus.mutationOptions({
      onSuccess: async (data) => {
        toast.success(`Order ${data.orderNumber} status updated successfully`);
        queryClient.invalidateQueries(
          trpc.orders.getPaginatedOrders.queryOptions({}),
        );
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to update status.");
      },
    }),
  );

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    updateStatusMutation.mutate({
      orderId,
      newStatus,
    });
  };

  // Add this sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleStatusFilterChange = (status: typeof params.status) => {
    setParams({
      ...params,
      status,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    setParams({
      ...params,
      page,
    });
  };

  const handleSearchChange = (value: string) => {
    setParams({
      ...params,
      search: value,
      page: 1,
    });
  };

  const handleDateChange = (
    startDate: Date | undefined,
    endDate: Date | undefined,
  ) => {
    setParams({
      ...params,
      startDate,
      endDate,
      page: 1,
    });
  };

  const clearFilters = () => {
    setParams({
      page: 1,
      pageSize: params.pageSize,
      search: "",
      status: "ALL",
      startDate: undefined,
      endDate: undefined,
    });
  };

  // view function
  const handleViewDetails = (order: OrderInfo) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  // ─── Pagination display helpers ───────────────────────────────────────────────
  // "Showing X to Y of Z entries"
  const firstEntry = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastEntry = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        {/* search input */}
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search orders..."
            className="max-w-sm"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Status & Date */}
      <div className="flex space-x-4 mb-4">
        {/* Status */}
        <Select
          onValueChange={(value) =>
            handleStatusFilterChange(value as typeof params.status)
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="UNVERIFIED">Unverified</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="FULFILLED">Fulfilled</SelectItem>
          </SelectContent>
        </Select>

        {/* date */}
        <DatePickerWithRange
          date={{
            from: normalizedStartDate,
            to: normalizedEndDate,
          }}
          setDate={(newDateRange) => {
            handleDateChange(newDateRange?.from, newDateRange?.to);
          }}
        />
      </div>

      <Suspense fallback={<OrderListSkeleton count={10} />}>
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
              {loadingOrders ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <p className="text-lg text-muted-foreground">
                      {search
                        ? "No matching orders found"
                        : "There is no order yet"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order, index) => (
                  <TableRow key={order.orderId}>
                    <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{formatDate(order.orderDate!)}</TableCell>
                    <TableCell>
                      {order.shippingInfo.firstName}{" "}
                      {order.shippingInfo.lastName}
                    </TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "font-medium border rounded-md px-3 py-1 text-white text-center inline-block cursor-default transition-colors",
                          {
                            "bg-[#da281c] border-[#da281c] hover:bg-[#b4443c]":
                              order.status === "CANCELLED",
                            "bg-green-500 border-green-500 hover:bg-green-600":
                              order.status === "FULFILLED",
                            "bg-[#fe9e1d] border-[#fe9e1d] hover:bg-[#c6893a]":
                              order.status === "UNVERIFIED",
                            "bg-orange-500 border-orange-500 hover:bg-orange-600":
                              order.status === "PENDING",
                          },
                        )}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        onValueChange={(value) =>
                          handleStatusChange(
                            order.orderId as string,
                            value as OrderStatus,
                          )
                        }
                        defaultValue={order.status}
                      >
                        <SelectTrigger className="w-45">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNVERIFIED">UNVERIFIED</SelectItem>
                          <SelectItem value="PENDING">PENDING</SelectItem>
                          <SelectItem value="FULFILLED">FULFILLED</SelectItem>
                          <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(order as OrderInfo)}
                      >
                        <Eye color="#fe9e1d" />
                        <span className="sr-only">View Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loadingOrders && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {firstEntry} to {lastEntry} of {totalCount} entries
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={!hasPreviousPage}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">
                  Page {page} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={!hasNextPage}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={page >= totalPages}
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Suspense>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-center">Order Details</DialogTitle>
            <DialogDescription className="sr-only">
              Order Details
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-100px)] pr-4">
            {selectedOrder && <OrderDetailsView data={selectedOrder} />}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
