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
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If no user is found, redirect to login page
    if (!loading && user === null) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Don't render children until we know the user is authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (user === null) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header show={false} />
      {children}
    </div>
  );
};
