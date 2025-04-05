import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import type { Metadata } from "next";
import { AdminLayoutContent } from "./admin-layout-content";

export const metadata: Metadata = {
  title: "VilleDishes - Admin",
  description: "Admin Dashboard",
};
export const runtime = "nodejs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LoadingProvider>
      <AuthProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AuthProvider>
    </LoadingProvider>
  );
}
