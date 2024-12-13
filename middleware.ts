import { NextResponse } from "next/server";

// import { adminAuth } from "./config/firebaseAdmin";

import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  try {
    // Validate token via API route
    const response = await fetch(`${req.nextUrl.origin}/api/verify-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const result = await response.json();

    if (!result.valid) {
      throw new Error("Invalid token");
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Token validation failed:", error);
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
