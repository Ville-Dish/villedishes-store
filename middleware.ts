import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

const tokenCache = new Map<
  string,
  { valid: boolean; expires: number; tokenExpiry?: number }
>();

//List of admin paths that don't require authentication
const openAdminPaths = ["/admin/verify-payment", "/admin/success"];

function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, cache] of tokenCache.entries()) {
    if (cache.expires <= now) {
      tokenCache.delete(token);
    }
  }
}

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
    // loginUrl.searchParams.set("from", encodeURIComponent(pathname));
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Call cleanup periodically:
  if (Math.random() < 0.01) {
    // 1% chance to cleanup on each request
    cleanupExpiredTokens();
  }

  try {
    // Check cache first
    const cached = tokenCache.get(token);
    const now = Date.now();

    if (cached && cached.expires > now) {
      // Additional check: if we know the token expiry, check that too
      if (cached.tokenExpiry && cached.tokenExpiry <= Math.floor(now / 1000)) {
        // Token is expired, remove from cache and revalidate
        tokenCache.delete(token);
      } else if (cached.valid) {
        return NextResponse.next();
      } else {
        throw new Error("Cached invalid token");
      }
    }

    // Validate token via API route
    const response = await fetch(`${req.nextUrl.origin}/api/verify-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const result = await response.json();

    if (!result.valid) {
      // Cache invalid result for 1 minute to prevent repeated calls
      tokenCache.set(token, {
        valid: false,
        expires: Date.now() + 60 * 1000, // 1 minute
      });
      throw new Error("Invalid token");
    }

    // Cache valid result with token expiry info
    const cacheExpiry = Math.min(
      Date.now() + 5 * 60 * 1000, // 5 minutes max
      (result.exp - 60) * 1000 // Or 1 minute before token expires
    );

    // Cache valid result for 5 minutes
    tokenCache.set(token, {
      valid: true,
      expires: cacheExpiry,
      tokenExpiry: result.exp, // Store Firebase token expiry
    });

    return NextResponse.next();
  } catch (error) {
    console.error("Token validation failed:", error);
    // const url = req.nextUrl.clone();
    // url.pathname = "/login";
    // return NextResponse.redirect(url);

    // Clear the invalid token from cache
    if (token) {
      tokenCache.delete(token);
    }

    const loginUrl = new URL("/login", req.url);
    // loginUrl.searchParams.set("from", encodeURIComponent(pathname));
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
