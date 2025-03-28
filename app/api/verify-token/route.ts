import { NextResponse } from "next/server";
import { adminAuth } from "@/config/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ valid: false, error: "No token provided" });
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token);

      const currentTime = Math.floor(Date.now() / 1000);

      if (decodedToken.exp && decodedToken.exp < currentTime) {
        return NextResponse.json({ valid: false, error: "Token expired" });
      }

      return NextResponse.json({ uid: decodedToken.uid, valid: true });
    } catch (verifyError) {
      console.error("Token verification error:", verifyError);
      return NextResponse.json(
        { error: "Invalid token", valid: false },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error in token verification:", error);
    return NextResponse.json(
      { error: "An error occurred during token verification", valid: false },
      { status: 401 }
    );
  }
}
