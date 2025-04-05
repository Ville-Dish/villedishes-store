"use client";

import { Header } from "@/components/custom/header";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const AdminLayoutContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If no user is found, redirect to login page
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  // Don't render children until we know the user is authenticated
  // You could also show a loading state here
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header show={false} />
      {children}
    </div>
  );
};
