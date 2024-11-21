import type { Metadata } from "next";
import { Footer } from "@/components/custom/footer";

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
      <div className="min-h-screen">{children}</div>
      <Footer />
    </>
  );
}
