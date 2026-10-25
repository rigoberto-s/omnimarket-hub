import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC = ["/login", "/api/auth", "/api/test"];

export default auth((req) => {
  const { pathname, origin } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", origin));
  }
  if (isPublic || isLoggedIn) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", origin));
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};