"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import { Eye } from "lucide-react";
import { DatePickerWithRange } from "@/components/custom/date-range-picker";
import { cn } from "@/lib/utils";

type OrderStatus = "UNVERIFIED" | "PENDING" | "CANCELLED" | "FULFILLED";

export default function AdminOrdersPage() {
  const [orders, setOrder] = useState<OrderDetails[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

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
      try {
        setLoading(true);
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
      }
    };
    fetchOrders();
  }, []);

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
  }, [searchTerm, statusFilter, dateRange, orders]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchTerm, statusFilter, dateRange, orders, applyFiltersAndSearch]);

  // view function
  const handleViewDetails = (order: OrderDetails) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <p>Loading orders...</p>;
  }

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

          {filteredOrders.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <p className="text-lg text-muted-foreground">
                    {searchTerm
                      ? "No matching orders found"
                      : "There is no order yet"}
                  </p>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {filteredOrders.map((order, index) => (
                <TableRow key={order.orderId}>
                  <TableCell>{index + 1}</TableCell>
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
              ))}
            </TableBody>
          )}
        </Table>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription className="sr-only">
              Order Details
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold mb-2">Shipping Information</h4>
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
                  <h4 className="font-bold mb-2">Order Summary</h4>
                  <p>Subtotal: ${selectedOrder.subtotal.toFixed(2)}</p>
                  <p>Tax: ${selectedOrder.tax.toFixed(2)}</p>
                  <p>Shipping: ${selectedOrder.shippingFee.toFixed(2)}</p>
                  <p className="font-semibold">
                    Total: ${selectedOrder.total.toFixed(2)}
                  </p>
                </div>
              </div>
              <h4 className="font-medium mt-4 mb-2">Products</h4>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.product.name}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>
                          ${product.product.price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {selectedOrder.shippingInfo.orderNotes && (
                <div className="mt-4">
                  <h4 className="font-medium">Order Notes</h4>
                  <p>{selectedOrder.shippingInfo.orderNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
