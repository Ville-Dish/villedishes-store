"use client";

import { Separator } from "@/components/ui/separator";
import { auth } from "@/config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromParam = searchParams.get("from");
    if (fromParam) {
      setFrom(fromParam);
    }
  }, [searchParams]);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // New token refresh logic
      const user = userCredential.user;
      const currentUser = auth.currentUser;

      let token = await user.getIdToken();

      // Force refresh token if possible
      if (currentUser) {
        token = await currentUser.getIdToken(true); // Force refresh
      }

      // Send the token to the server-side route
      const response = await fetch("/api/set-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to set authentication token"
        );
      }

      // Redirect the user to the dashboard
      // router.push("/admin/dashboard");
      router.push(from || "/admin/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100">
      <Image
        src="https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187728/ville-logo_u98blv.png"
        alt="Logo"
        priority
        width={200}
        height={200}
        className="mb-4 size-[200px]"
      />
      <div className="border px-8 py-6 shadow-lg flex flex-col space-y-6 w-full max-w-md rounded-lg bg-white">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          Admin Login
        </h1>
        <Separator className="bg-gray-200" />
        <div className="space-y-4">
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              className="w-full h-11 px-4 pt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1aa879] focus:border-transparent transition-all peer placeholder-transparent"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <label
              htmlFor="email"
              className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all 
                peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#1aa879]"
            >
              Email
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              id="password"
              value={password}
              className="w-full h-11 px-4 pt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1aa879] focus:border-transparent transition-all peer placeholder-transparent"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <label
              htmlFor="password"
              className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all 
                peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#1aa879]"
            >
              Password
            </label>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          className="w-full bg-[#1aa879] py-3 rounded-md text-white font-semibold hover:bg-[#1cd396] transition-colors duration-200 text-lg"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
