import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedRequest } from "./app/lib/site-auth";

const PUBLIC_PATHS = new Set(["/login", "/api/auth/login", "/robots.txt"]);

function withNoIndexHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "X-Robots-Tag",
    "noindex, nofollow, noarchive, nosnippet"
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return withNoIndexHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/api/")) {
    if (!(await isAuthorizedRequest(request))) {
      return withNoIndexHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      );
    }

    return withNoIndexHeaders(NextResponse.next());
  }

  return withNoIndexHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
