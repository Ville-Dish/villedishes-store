"use client";

import React, { useState } from "react";
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
import useOrderStore from "@/stores/useOrderStore";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminOrdersPage() {
  const { orders, updateOrder } = useOrderStore();
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrder(orderId, {
        status: newStatus as "pending" | "verified" | "cancelled",
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* <h1 className="text-2xl font-bold mb-4 text-center">Orders</h1> */}
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
        <TableBody>
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <TableRow>
                <TableCell>{order.id}</TableCell>
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
                      handleStatusChange(order.id, value)
                    }
                    defaultValue={order.status}
                    disabled={updatingOrderId === order.id}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleOrderDetails(order.id)}
                  >
                    {expandedOrderId === order.id ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
              {expandedOrderId === order.id && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-semibold mb-2">Order Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium">Shipping Information</h4>
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
                              <TableCell>{product.name}</TableCell>
                              <TableCell>{product.quantity}</TableCell>
                              <TableCell>${product.price.toFixed(2)}</TableCell>
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
      </Table>
    </div>
  );
}
