import { SignUpForm } from "@/components/signup-form";
import { requireNoAuth } from "@/lib/session/server-session";
import Image from "next/image";
import React from "react";

const SignUpPage = async () => {
  await requireNoAuth();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100">
      <Image
        src="https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187728/ville-logo_u98blv.png"
        alt="Logo"
        priority
        width={150}
        height={150}
        className="mb-4 size-[100px]"
      />
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
