"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();

      // Send the token to the server-side route
      const response = await fetch("/api/set-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Failed to set authentication token");
      }

      // Redirect the user to the dashboard
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full container mx-auto flex flex-col items-center justify-center bg-gray-100">
      <Image
        src="/assets/ville-logo.png"
        alt="Logo"
        width={200}
        height={200}
        className="mb-4"
      />
      <div className="border px-4 shadow-md flex flex-col space-y-4 w-1/2  h-1/3 rounded-md bg-white">
        <h1 className="mt-4 text-2xl font-semibold text-center">Admin Login</h1>
        <Separator />
        <input
          type="email"
          placeholder="Email"
          value={email}
          className="h-9 px-2 border rounded-md focus:outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          className="h-9 px-2 border rounded-md focus:outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          className="w-full bg-[#1aa879] py-2 rounded-md text-white font-semibold hover:bg-[#1cd396]"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
