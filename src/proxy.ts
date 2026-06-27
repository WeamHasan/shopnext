import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/products", "/login", "/signup"];

export async function proxy(req: NextRequest) {

    const { pathname, search } = req.nextUrl;

    const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith("/products")
    );

    if (isPublicRoute) return NextResponse.next()

    const sessionCookie = 
      req.cookies.get("authjs.session-token") ||
      req.cookies.get("__Secure-authjs.session-token")

    if (!sessionCookie) {
        const loginUrl = new URL("/login", req.nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    //Skipped: _next/static, _next/image, favicon.ico, api/auth
    //Skipping api/auth is very important. Auth.js needs its own routes to work without being intercepted by the route guard
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
    ],
};

