"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminAvatar from "./admin_avatar";
import { AdminNavbarMenu } from "./admin_navbar_menu";
import { NavbarMenu } from "./navbar_menu";
import ShoppingCart from "./shopping-cart";

export const Header = ({ show }: { show: boolean }) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-4 my-4">
      <div className="flex-shrink-0">
        <Link href={show ? "/" : "/admin/dashboard"}>
          <Image
            src="https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187507/ville-logo_mkhrsj.svg"
            alt="VilleDishes Logo"
            width={100}
            height={50}
            priority
            className="w-[100px] h-[50px]"
          />
        </Link>
      </div>
      <div className="flex items-center flex-row-reverse md:flex-1 md:flex-row">
        <div className="flex-grow flex justify-center">
          {show ? <NavbarMenu /> : <AdminNavbarMenu />}
        </div>

        <div className="flex-shrink-0">
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
