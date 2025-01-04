"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminAvatar() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { logOut, user } = useAuth();

  const avatarFallback = user?.displayName?.charAt(0) || user?.email?.charAt(0);

  const handleLogout = async () => {
    try {
      await logOut();
      setSheetOpen(false);
      router.push("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSettings = () => {
    console.log("Clicked Setting Button");
    try {
      router.push("/admin/settings");
    } catch (error) {
      console.error("Error:", error);
    }
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
            <AvatarFallback>{avatarFallback?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium">Admin Options</p>
          <Button size="sm" onClick={handleSettings} className="bg-[#f5ad07]">
            Settings
          </Button>

          <Button size="sm" onClick={handleLogout} className="bg-[#da281c]">
            Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
