import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

// Next.js 16: Middleware is now called Proxy.
export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const isAuthed = Boolean(req.auth);

  const isAuthPath = pathname === "/login";
  const isApiIngest = pathname.startsWith("/api/leads");
  const isNextAuthApi = pathname.startsWith("/api/auth");

  if (isApiIngest || isNextAuthApi) return NextResponse.next();

  if (!isAuthed && !isAuthPath) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthed && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
