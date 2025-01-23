import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

//List of admin paths that don't require authentication
const openAdminPaths = ["/admin/verify-payment", "/admin/success"];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  if (openAdminPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    // const url = req.nextUrl.clone();
    // url.pathname = "/login";
    // return NextResponse.redirect(url);

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", encodeURIComponent(pathname));
    return NextResponse.redirect(loginUrl);
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
    // const url = req.nextUrl.clone();
    // url.pathname = "/login";
    // return NextResponse.redirect(url);

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", encodeURIComponent(pathname));
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
