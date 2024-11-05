"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { taxRate } from "@/lib/constantData";
import useCartStore from "@/stores/useCartStore";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartPage() {
  const { cartItems, subtotal, removeFromCart, updateCartItem, total } =
    useCartStore();

  const tax = (taxRate / 100) * subtotal;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        {cartItems.length === 0 ? (
          <div className="text-center">
            <p className="mb-4">Your cart is empty.</p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateCartItem(item.id, -1)}
                          disabled={item.quantity === 1}
                          className="disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          className="w-16 text-center"
                          min={1}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateCartItem(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      ${(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-8 flex gap-8 justify-between items-center">
              <div className="">
                <div className="text-lg font-semibold mb-2">
                  Subtotal: ${subtotal.toFixed(2)}
                </div>
                <div className="text-lg font-semibold mb-2">
                  Tax({taxRate}%): ${tax.toFixed(2)}
                </div>
                <div className="text-2xl font-bold mb-4">
                  Total: ${total.toFixed(2)}
                </div>
              </div>
              <Link href="/checkout">
                <Button size="lg">Proceed to Checkout</Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
