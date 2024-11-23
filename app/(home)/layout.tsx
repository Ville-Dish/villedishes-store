import type { Metadata } from "next";
import { Footer } from "@/components/custom/footer";
import { Header } from "@/components/custom/header";

export const metadata: Metadata = {
  title: "VilleDishes",
  description: "Nigerian meal at your finger tips",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="min-h-screen">
        <Header show />
        {children}
        <Footer />
      </div>
    </>
  );
}
