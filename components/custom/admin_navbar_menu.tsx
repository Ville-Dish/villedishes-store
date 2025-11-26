"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { adminMenuItems } from "@/lib/constantData";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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
      className={cn(
        "text-lg text-muted-foreground font-semibold hover:text-primary underline-offset-4 relative after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300",
        pathname === href && "text-primary after:w-full"
      )}
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
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="bg-transparent">
              <Menu className="h-8 w-8" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Navigation for Smaller Screens
              </SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-4">
              {menuItems.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  onClick={() => setIsOpen(false)}
                />
              ))}
              <Button>Logout</Button>
            </nav>
          </SheetContent>
        </Sheet>
      ) : (
        <nav className="hidden md:flex gap-4 sm:gap-6">
          {menuItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      )}
    </header>
  );
};
