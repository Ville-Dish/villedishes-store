import type { Metadata } from "next";
import { Footer } from "@/components/custom/footer";
import { Header } from "@/components/custom/header";
import { requireNoAuth } from "@/lib/session/server-session";

export const metadata: Metadata = {
  title: "VilleDishes",
  description: "Nigerian meal at your finger tips",
};

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col justify-between overflow-auto">
      <Header show />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
