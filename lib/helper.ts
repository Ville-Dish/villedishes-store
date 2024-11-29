import { adminAuth } from "@/config/firebaseAdmin";

export async function verifyToken(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) throw new Error("Unauthorized");

  try {
    await adminAuth.verifyIdToken(token);
  } catch {
    throw new Error("Unauthorized");
  }
}
