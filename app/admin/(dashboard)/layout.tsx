import { Header } from "@/components/custom/header";
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
    <div className="min-h-screen">
      <Header show={false} />
      {children}
    </div>
  );
}
