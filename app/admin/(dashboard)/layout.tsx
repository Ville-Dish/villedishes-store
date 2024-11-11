import { Toaster } from "sonner";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "../../globals.css";
import { Header } from "@/components/custom/header";

const geistSans = localFont({
  src: "../../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  // src: "../fonts/GeistMonoVF.woff",
  src: "../../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "VilleDishes- Admin",
  description: "Admin Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header show={false} />
        <div className="min-h-screen">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
