import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "super-secret-key";

interface SessionPayload {
  id: string;
  email: string;
  role: string;
}

export async function signJWT(payload: SessionPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
}

export async function verifyJWT(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyJWT(token);
}

export async function setSession(user: SessionPayload) {
  const token = await signJWT({ id: user.id, email: user.email, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}
