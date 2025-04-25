import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"


function doesRequestPathStartWithAnyPaths(req: NextRequest, paths: string[]) {
  return paths.some((path) => req.nextUrl.pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const hasSessionToken =
    request.cookies.has("next-auth.session-token")

  const isPublicPath =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/api/auth")

  const isApiPath = request.nextUrl.pathname.startsWith("/api") && !request.nextUrl.pathname.startsWith("/api/auth")

  if (isApiPath && !hasSessionToken) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (!isPublicPath && !hasSessionToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api)(.*)'],
};
