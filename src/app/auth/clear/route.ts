import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "kurs_session";

/** Stale JWT (masalan, DB seed dan keyin) ni tozalaydi. */
export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);

  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url);
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
