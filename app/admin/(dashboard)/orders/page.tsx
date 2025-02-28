"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLoading } from "@/context/LoadingContext";

type OrderStatus = "UNVERIFIED" | "PENDING" | "CANCELLED" | "FULFILLED";

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [orders, setOrder] = useState<OrderDetails[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderDetails[]>([]);
  const { setIsLoading } = useLoading();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order status");
      }

      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    setUpdatingOrderId(orderId);
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      const updatedOrders = orders.map((order) =>
        order.orderId === orderId
          ? { ...order, status: updatedOrder.status }
          : order
      );
      setOrder(updatedOrders);
      applyFiltersAndSearch();
      console.log(`Order ${orderId} status updated to ${newStatus}`);
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Failed to update order status:", error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/orders", { method: "GET" });
        const data = await response.json();
        if (response.ok) {
          setOrder(data.data || []);
          setFilteredOrders(data.data || []);
        } else {
          console.error("Failed to fetch orders:", data.message);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [setIsLoading]);

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = orders;

    // Apply search
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((order) =>
        Object.entries(order).some(([key, value]) => {
          if (key === "shippingInfo") {
            const { firstName, lastName } = value as {
              firstName: string;
              lastName: string;
            };
            const fullName = `${firstName} ${lastName}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
          }
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply date range filter
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((order) => {
        const orderDate = order.orderDate ? new Date(order.orderDate) : null;
        return (
          orderDate &&
          orderDate >= dateRange.from! &&
          orderDate <= dateRange.to!
        );
      });
    }

    setFilteredOrders(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));

    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateRange, orders, itemsPerPage]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchTerm, statusFilter, dateRange, orders, applyFiltersAndSearch]);

  // view function
  const handleViewDetails = (order: OrderDetails) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (page === 1) {
      router.push(`/admin/orders`);
    } else {
      router.push(`/admin/orders?page=${page}`);
    }
  };

  // Get current orders
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search orders..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <Select
          onValueChange={(value) =>
            setStatusFilter(value as OrderStatus | "all")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="UNVERIFIED">Unverified</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="FULFILLED">Fulfilled</SelectItem>
          </SelectContent>
        </Select>
        <DatePickerWithRange
          date={{
            from: dateRange.from,
            to: dateRange.to,
          }}
          setDate={(newDateRange) => {
            setDateRange({
              from: newDateRange?.from || undefined,
              to: newDateRange?.to || undefined,
            });
          }}
        />
      </div>

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

            {
              loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) :
                currentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <p className="text-lg text-muted-foreground">
                        {searchTerm
                          ? "No matching orders found"
                          : "There is no order yet"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : currentOrders.map((order, index) => (
                  <TableRow key={order.orderId}>
                    <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>
                      {order.shippingInfo.firstName} {order.shippingInfo.lastName}
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
                          }
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
                            value as OrderStatus
                          )
                        }
                        defaultValue={order.status}
                        disabled={updatingOrderId === order.orderId}
                      >
                        <SelectTrigger className="w-[180px]">
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
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye color="#fe9e1d" />
                        <span className="sr-only">View Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
                )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && filteredOrders.length > 0 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-center">Order Details</DialogTitle>
            <DialogDescription className="sr-only">
              Order Details
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-100px)] pr-4">
            {selectedOrder && (
              <div className="mt-4 bg-white p-6 rounded-lg shadow-md">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">Order Receipt</h2>
                  <p className="text-gray-600">
                    Order #{selectedOrder.orderNumber}
                  </p>
                  <p className="text-gray-600">{selectedOrder.orderDate}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-bold mb-2">Bill To:</h4>
                    <p>
                      {selectedOrder.shippingInfo.firstName}{" "}
                      {selectedOrder.shippingInfo.lastName}
                    </p>
                    <p>{selectedOrder.shippingInfo.address}</p>
                    <p>
                      {selectedOrder.shippingInfo.city},{" "}
                      {selectedOrder.shippingInfo.postalCode}
                    </p>
                    <p>Email: {selectedOrder.shippingInfo.email}</p>
                    <p>Phone: {selectedOrder.shippingInfo.phoneNumber}</p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Ship To:</h4>
                    <p>
                      {selectedOrder.shippingInfo.firstName}{" "}
                      {selectedOrder.shippingInfo.lastName}
                    </p>
                    <p>{selectedOrder.shippingInfo.address}</p>
                    <p>
                      {selectedOrder.shippingInfo.city},{" "}
                      {selectedOrder.shippingInfo.postalCode}
                    </p>
                  </div>
                </div>

                <h4 className="font-medium mt-4 mb-2">Products</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.product.name}</TableCell>
                        <TableCell className="text-right">
                          {product.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ${product.product.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${product.quantity * product.product.price}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 flex justify-end">
                  <div className="w-1/2">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal:</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between mb-2">
                      <span>Tax:</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between mb-2">
                      <span>Shipping:</span>
                      <span>${selectedOrder.shippingFee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between mb-2">
                      <span>Total:</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {selectedOrder.shippingInfo.orderNotes && (
                  <div className="mt-6">
                    <h4 className="font-bold mb-2">Order Notes:</h4>
                    <p className="text-gray-700">
                      {selectedOrder.shippingInfo.orderNotes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}