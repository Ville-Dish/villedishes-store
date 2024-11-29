"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBasket as CartIcon } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AdminAvatar() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  const handleSettings = () => {
    console.log("Clicked Setting Button");
  };
  return (
    <Popover open={sheetOpen} onOpenChange={setSheetOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-[#adadad] relative">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>VD</AvatarFallback>
          </Avatar>
          <span className="absolute top-2 -right-10 text-xs text-[#fe9e1d]">
            Admin
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-4">
          <p>Logout or Change your settings</p>
          <Button size="sm" onClick={logout} className="bg-[#da281c]">
            Logout
          </Button>

          <Button size="sm" onClick={handleSettings} className="bg-[#f5ad07]">
            Settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
