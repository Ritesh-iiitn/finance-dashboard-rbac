import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
  const isLoginRoute = req.nextUrl.pathname === "/login";
  const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");

  if (isAuthRoute) return NextResponse.next();

  if (isLoginRoute) {
    if (isLoggedIn) return Response.redirect(new URL("/dashboard", req.nextUrl));
    return NextResponse.next();
  }

  if (isApiRoute) {
    if (!isLoggedIn) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    return NextResponse.next();
  }

  if (isDashboardRoute) {
    if (!isLoggedIn) return Response.redirect(new URL("/login", req.nextUrl));
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
