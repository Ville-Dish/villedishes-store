"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBasket as CartIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import useCartStore, {
  useCartQuantity,
  useCartSubtotal,
} from "@/stores/useCartStore";

export default function ShoppingCart() {
  const { cartItems, removeFromCart } = useCartStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const subtotal = useCartSubtotal();
  const totalQuantity = useCartQuantity();

  // Wait for hydration before showing cart data
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-[#adadad] relative">
          <CartIcon className="mr-2 size-4 text-lg text-[#181d1b]" />
          <span className="absolute top-2 right-2 text-xs text-[#fe9e1d]">
            {mounted ? totalQuantity : 0}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>
            Review your items before checkout. The total will be provided at
            checkout
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8">
          {!mounted ? (
            <CartIcon className="size-4 text-lg text-[#181d1b]" />
          ) : cartItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      ${item.price} x {item.quantity}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {mounted && (
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span>SubTotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-4">
              <Button
                className="w-full"
                onClick={() => setSheetOpen(false)}
                asChild
              >
                <Link href="/cart">Go to Cart</Link>
              </Button>

              {cartItems.length > 0 && (
                <Button
                  className="w-full"
                  onClick={() => setSheetOpen(false)}
                  asChild
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
