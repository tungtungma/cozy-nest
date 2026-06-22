import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Password protection (basic auth)
function checkBasicAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return new NextResponse("Authentication Required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Cozy Nest"' },
    });
  }

  const auth = atob(authHeader.split(" ")[1]).split(":");
  const user = auth[0];
  const pass = auth[1];

  if (user === "admin" && pass === "cozy123") {
    return null; // auth passed
  }

  return new NextResponse("Invalid Credentials", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Cozy Nest"' },
  });
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Basic auth for entire site (except API routes & static files)
  const basicAuthResult = checkBasicAuth(req);
  if (basicAuthResult) return basicAuthResult;

  // Protect admin routes with NextAuth
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = req.auth;
    if (!token) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (token.user?.role !== "admin") {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)"],
};
