"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/useAuthStore";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";

export default function AdminAvatar() {
  const [sheetOpen, setSheetOpen] = useState(false);
  // const logout = useAuthStore((state) => state.logout);

  const logout = async () => {
    await signOut(auth);
  };

  const handleSettings = () => {
    console.log("Clicked Setting Button");
  };
  return (
    <Popover open={sheetOpen} onOpenChange={setSheetOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#adadad] relative p-0"
        >
          <Avatar>
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="Admin Avatar"
            />
            <AvatarFallback>VD</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium">Admin Options</p>
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
