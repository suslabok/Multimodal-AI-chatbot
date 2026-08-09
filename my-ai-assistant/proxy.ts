import { NextResponse } from "next/server"

import { auth } from "@/lib/server/auth/auth"

export default auth((request) => {
  const isSignedIn = Boolean(request.auth)
  const isSignInPage = request.nextUrl.pathname.startsWith("/sign-in")
  const isAuthApiRoute = request.nextUrl.pathname.startsWith("/api/auth")

  if (isAuthApiRoute) {
    return NextResponse.next()
  }

  if (!isSignedIn && !isSignInPage) {
    const signInUrl = new URL("/sign-in", request.nextUrl.origin)
    return NextResponse.redirect(signInUrl)
  }

  if (isSignedIn && isSignInPage) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}