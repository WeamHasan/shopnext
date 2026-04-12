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
