import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

export const runtime = "nodejs";

const SESSION_COOKIE_NAME = "session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isCartRoute = pathname.startsWith("/cart");
  const isCheckoutRoute = pathname.startsWith("/checkout");

  if (isAdminRoute || isCartRoute || isCheckoutRoute) {
    console.log(`[Middleware] Protecting route: ${pathname}`);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      console.log("[Middleware] No session cookie found");

      const url = request.nextUrl.clone();
      url.pathname = "/user/signup";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    try {
      // checkRevoked: true ensures revoked tokens are rejected
      const decodedClaims = await adminAuth.verifySessionCookie(
        sessionCookie,
        true
      );

      console.log(
        `[Middleware] Verified user: ${decodedClaims.sub}, role: ${
          decodedClaims.role || "customer"
        }`
      );

      const userRole = decodedClaims.role || "customer";

      if (isAdminRoute && userRole !== "admin" && userRole !== "superAdmin") {
        console.log(`[Middleware] Insufficient permissions: ${userRole}`);

        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

      console.log(`[Middleware] Access granted to ${pathname}`);
      return NextResponse.next();
    
    } catch (error) {
      console.log(`[Middleware] Verification failed:`, error);

      const url = request.nextUrl.clone();
      url.pathname = "/user/signup";
      url.searchParams.set("redirect", pathname);

      const response = NextResponse.redirect(url);

      response.cookies.delete(SESSION_COOKIE_NAME);
      console.log("[Middleware] Cleared invalid session cookie");

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*|_next).*)",
  ],
};
