import { Header } from "@/components/custom/header";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VilleDishes- Admin",
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
        <div className="min-h-screen">
          <Header show={false} />
          {children}
        </div>
      </AuthProvider>
    </LoadingProvider>
  );
}
