"use client";

import { useSession } from "@/lib/auth-client";
import { CustomAvatar } from "./custom-avatar";

export default function AdminAvatar() {
  const { data: session } = useSession();

  const avatarFallback =
    session?.user?.userName?.charAt(0) ||
    session?.user?.email?.charAt(0) ||
    session?.user?.name?.charAt(0);

  return <CustomAvatar avatarFallback={avatarFallback} />;
}
