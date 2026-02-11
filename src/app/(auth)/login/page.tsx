import Image from "next/image";

import { requireNoAuth } from "@/lib/session/server-session";
import { LoginForm } from "@/features/auth/components/login-form";

const LoginPage = async () => {
  await requireNoAuth();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100">
      <Image
        src="https://res.cloudinary.com/dxt7vk5dg/image/upload/v1743187728/ville-logo_u98blv.png"
        alt="Logo"
        priority
        width={200}
        height={200}
        className="mb-4 size-50"
      />
      <LoginForm />
    </div>
  );
};
export default LoginPage;
