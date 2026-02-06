"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminAvatar from "@/components/custom/admin_avatar";
import { AdminNavbarMenu } from "@/components/custom/admin_navbar_menu";
import { NavbarMenu } from "@/components/custom/navbar_menu";
import ShoppingCart from "@/components/custom/shopping-cart";

export const Header = ({ show }: { show: boolean }) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-4 my-4">
      <div className="shrink-0">
        <Link href={show ? "/" : "/admin/dashboard"}>
          <Image
            src="https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187507/ville-logo_mkhrsj.svg"
            alt="VilleDishes Logo"
            width={100}
            height={50}
            priority
            className="w-25 h-12.5"
          />
        </Link>
      </div>
      <div className="flex items-center flex-row-reverse md:flex-1 md:flex-row">
        <div className="grow flex justify-center">
          {show ? <NavbarMenu /> : <AdminNavbarMenu />}
        </div>

        <div className="shrink-0">
          {show ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#adadad] hover:bg-transparent"
                title="Admin"
                onClick={() => router.push("/admin/dashboard")}
              >
                <Shield className="h-32 w-32 text-lg text-[#181d1b]" />
              </Button>
              <ShoppingCart />
            </div>
          ) : (
            <AdminAvatar />
          )}
        </div>
      </div>
    </div>
  );
};
