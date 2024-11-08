import Image from "next/image";
import Link from "next/link";

import ShoppingCart from "./shopping-cart";
import { NavbarMenu } from "./navbar_menu";

export const Header = ({ show }: { show: boolean }) => {
  return (
    <div className="flex gap-20 justify-between items-center px-4 my-4">
      <Link href="/" className="flex gap-7">
        <Image
          src="/assets/ville.svg"
          alt="VilleDishes Logo"
          width={50}
          height={50}
        />
        <h1 className="text-3xl font-bold hidden md:inline">VilleDishes</h1>
      </Link>
      {show && (
        <div className="md:flex-[40%] flex flex-row-reverse md:flex-row items-center md:justify-between">
          <NavbarMenu />
          <ShoppingCart />
        </div>
      )}
    </div>
  );
};
