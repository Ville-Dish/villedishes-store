import { Header } from "@/components/custom/header";
import { LoadingProvider } from "@/context/LoadingContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VilleDishes- Admin",
  description: "Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LoadingProvider>
      <div className="min-h-screen">
        <Header show={false} />
        {children}
      </div>
    </LoadingProvider>
  );
}
