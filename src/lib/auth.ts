import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "meeting-book-dev-secret-change-in-production"
);
const COOKIE_NAME = "session";

export type SessionUser = {
  id: string;
  workId: string;
  name: string;
  namespaceId: string | null;
  namespaceName: string | null;
  role: string; // "user" | "admin"
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.sub as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        workId: true,
        name: true,
        namespaceId: true,
        role: true,
        namespace: { select: { name: true } },
      },
    });
    if (!user) return null;
    return {
      id: user.id,
      workId: user.workId,
      name: user.name,
      namespaceId: user.namespaceId,
      namespaceName: user.namespace?.name ?? null,
      role: user.role ?? "user",
    };
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setExpirationTime("7d")
    .sign(SECRET);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
