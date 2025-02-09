import Image from "next/image";
import Link from "next/link";

import ShoppingCart from "./shopping-cart";
import { NavbarMenu } from "./navbar_menu";
import { AdminNavbarMenu } from "./admin_navbar_menu";
import AdminAvatar from "./admin_avatar";

export const Header = ({ show }: { show: boolean }) => {
  return (
    <div className="flex items-center justify-between px-4 my-4">
      <div className="flex-shrink-0">
        <Link href={show ? "/" : "/admin/dashboard"}>
          <Image
            src="https://res.cloudinary.com/dxt7vk5dg/image/upload/v1737565949/ville-logo_nuigjy.svg"
            alt="VilleDishes Logo"
            width={100}
            height={50}
          />
        </Link>
      </div>
      <div className="flex items-center flex-row-reverse md:flex-1 md:flex-row">
        <div className="flex-grow flex justify-center">
          {show ? <NavbarMenu /> : <AdminNavbarMenu />}
        </div>

        <div className="flex-shrink-0">
          {show ? <ShoppingCart /> : <AdminAvatar />}
        </div>
      </div>
    </div>
  );
};
