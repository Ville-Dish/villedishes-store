import { NextResponse } from "next/server";
import { adminAuth } from "@/config/firebaseAdmin";

export async function POST(req: Request) {
  const { token } = await req.json();

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return NextResponse.json({ uid: decodedToken.uid, valid: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid token", valid: false },
      { status: 401 }
    );
  }
}
