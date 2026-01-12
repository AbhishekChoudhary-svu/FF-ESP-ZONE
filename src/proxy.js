import { NextResponse } from "next/server"

export function proxy(req) {
  const { pathname } = req.nextUrl

  const isDashboard = pathname.startsWith("/dashboard")
  const isAdmin = pathname.startsWith("/admin")

  if (!isDashboard && !isAdmin) {
    return NextResponse.next()
  }

  const sessionCookie = req.cookies.get("session")?.value

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  let session
  try {
    session = JSON.parse(
      (sessionCookie)
    )
  } catch {
    return NextResponse.redirect(new URL("/login", req.url))
  }

 
  if (!session.emailVerified) {
    return NextResponse.redirect(
      new URL(`/verify-email?email=${session.email}`, req.url)
    )
  }

  
  if (isAdmin && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
