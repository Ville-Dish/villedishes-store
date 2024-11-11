"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { adminMenuItems } from "@/lib/constantData";

export const AdminNavbarMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const pathname = usePathname();

  const menuItems = adminMenuItems;

  const handleResize = useCallback(() => {
    setIsLargeScreen(window.innerWidth > 768);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [handleResize]);

  const NavLink = ({
    href,
    label,
    onClick,
  }: {
    href: string;
    label: string;
    onClick?: () => void;
  }) => (
    <Link
      className={`text-lg font-semibold hover:underline underline-offset-4 ${
        pathname === href && "underline"
      }`}
      href={href}
      onClick={onClick}
    >
      {label}
    </Link>
  );

  return (
    <header className="flex items-center justify-between">
      {!isLargeScreen ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="bg-transparent">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-4">
              {menuItems.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      ) : (
        <nav className="flex gap-4 sm:gap-6">
          {menuItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      )}
    </header>
  );
};
