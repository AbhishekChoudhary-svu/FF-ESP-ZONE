import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebaseAdmin"
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/users.model"

export async function middleware(req) {
  const { pathname } = req.nextUrl
  const dashboard = pathname.startsWith("/dashboard")
  const admin = pathname.startsWith("/admin")

  if (!dashboard && !admin) return NextResponse.next()

  const sessionCookie = req.cookies.get("session")?.value
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  let session
  try {
    session = JSON.parse(sessionCookie)
  } catch {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    
    await adminAuth.getUser(session.uid)

    
    await dbConnect()
    const user = await User.findOne({ uid: session.uid })
    if (!user) return NextResponse.redirect(new URL("/login", req.url))

    
    if (!user.emailVerified) {
      return NextResponse.redirect(
        new URL(`/verify-email?email=${user.email}`, req.url)
      )
    }

    
    if (admin && user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  } catch (err) {
   
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
