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
  return <div className="min-h-screen">{children}</div>;
}
