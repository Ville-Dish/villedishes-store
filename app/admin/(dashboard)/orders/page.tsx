"use client";

import React, { useEffect, useState } from "react";
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
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type OrderStatus = "UNVERIFIED" | "PENDING" | "CANCELLED" | "FULFILLED";

export default function AdminOrdersPage() {
  const [orders, setOrder] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
      setOrder(
        orders.map((order) =>
          order.orderId === orderId
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
      console.log(`Order ${orderId} status updated to ${newStatus}`);
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Failed to update order status:", error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/orders", { method: "GET" });
        const data = await response.json();
        if (response.ok) {
          console.log("DATA", data.data);
          setOrder(data.data || []);
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

  if (loading) {
    return <p>Loading invoices...</p>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <div className="flex items-center space-x-2">
          <Input placeholder="Search orders..." className="max-w-sm" />
          <Button>
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Order No.</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>

        {orders.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <p className="text-lg text-muted-foreground">
                  There is no order yet
                </p>
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {orders.map((order) => (
              <React.Fragment key={order.orderId}>
                <TableRow>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.orderDate}</TableCell>
                  <TableCell>
                    {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>{order.status}</TableCell>
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
                      onClick={() =>
                        toggleOrderDetails(order.orderId as string)
                      }
                    >
                      {expandedOrderId === order.id ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedOrderId === order.orderId && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="font-semibold mb-2">Order Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium">
                              Shipping Information
                            </h4>
                            <p>
                              {order.shippingInfo.firstName}{" "}
                              {order.shippingInfo.lastName}
                            </p>
                            <p>{order.shippingInfo.address}</p>
                            <p>
                              {order.shippingInfo.city},{" "}
                              {order.shippingInfo.postalCode}
                            </p>
                            <p>Email: {order.shippingInfo.email}</p>
                            <p>Phone: {order.shippingInfo.phoneNumber}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Order Summary</h4>
                            <p>Subtotal: ${order.subtotal.toFixed(2)}</p>
                            <p>Tax: ${order.tax.toFixed(2)}</p>
                            <p>Shipping: ${order.shippingFee.toFixed(2)}</p>
                            <p className="font-semibold">
                              Total: ${order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <h4 className="font-medium mt-4 mb-2">Products</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Price</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.products.map((product) => (
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
                        {order.shippingInfo.orderNotes && (
                          <div className="mt-4">
                            <h4 className="font-medium">Order Notes</h4>
                            <p>{order.shippingInfo.orderNotes}</p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        )}
      </Table>
    </div>
  );
}
