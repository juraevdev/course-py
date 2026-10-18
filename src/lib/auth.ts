import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "./prisma";

const COOKIE_NAME = "kurs_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type AuthState =
  | { status: "anon" }
  | { status: "stale" }
  | { status: "forbidden"; user: SessionUser }
  | { status: "ok"; user: SessionUser };

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

/** JWT + DB tekshiruvi. Seed dan keyin eski cookie `stale` bo‘ladi. */
export async function getAuthState(role?: Role): Promise<AuthState> {
  const session = await getSession();
  if (!session) return { status: "anon" };

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return { status: "stale" };

  const current: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  if (role && user.role !== role) {
    return { status: "forbidden", user: current };
  }

  return { status: "ok", user: current };
}

export async function requireUser(role?: Role) {
  const state = await getAuthState(role);
  if (state.status === "ok") return state.user;
  return null;
}
