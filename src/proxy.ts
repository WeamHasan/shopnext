import { auth } from "./lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/products", "/login", "/signup"];

export async function proxy(req: NextRequest) {
    const session = await auth();
    const isLoggedIn = !!session;

    const { pathname, search } = req.nextUrl;

    const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith("/products")
    );

    if (!isPublicRoute && !isLoggedIn) {
        const loginUrl = new URL("/login", req.nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
    ],
};














/* 
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// No import from @/lib/auth here — that's the entire point of this fix.
// Importing auth previously caused Prisma + bcrypt to load on every request.
// Now we only import Next.js's own lightweight request/response types.

const publicRoutes = ["/", "/products", "/login", "/signup"]

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Check public routes first — let them through immediately
  // without any cookie checking at all. Fastest possible path.
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/products")
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Optimistic cookie check — we verify the cookie EXISTS without
  // cryptographically verifying its contents. The full JWT verification
  // still happens in each Server Component via auth(). This proxy is
  // just a fast first filter that catches obviously unauthenticated
  // requests before they reach the rendering pipeline.
  //
  // Auth.js v5 cookie names differ by environment:
  // - HTTP (development): "authjs.session-token"
  // - HTTPS (production):  "__Secure-authjs.session-token"
  const sessionCookie =
    req.cookies.get("authjs.session-token") ||
    req.cookies.get("__Secure-authjs.session-token")

  if (!sessionCookie) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    // Preserving search params here (Codex addition) — important for
    // URLs like /cart?ref=homepage so nothing gets lost after login.
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  // Cookie exists — let the request through optimistically.
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
}
 */