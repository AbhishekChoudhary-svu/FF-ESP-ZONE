import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebaseAdmin"
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/users.model"

export async function POST(req) {
  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token missing" },
        { status: 400 }
      )
    }

    // 🔐 Verify Firebase token
    const decoded = await adminAuth.verifyIdToken(idToken)

    await dbConnect()

    // ✅ CHECK EXISTING USER
    let user = await User.findOne({ uid: decoded.uid })

    // 🆕 CREATE USER IF NOT EXISTS
    if (!user) {
      user = await User.create({
        uid: decoded.uid,
        email: decoded.email,
        username:
          decoded.name ||
          decoded.email.split("@")[0],
        ffUid :decoded.name,
        emailVerified: decoded.email_verified ?? true,
        role: "user",
        plan: "basic",
        provider: "google",
      })
    }
    const session = {
          uid: user.uid,
          email: user.email,
          role: user.role || "user",
          emailVerified: user.emailVerified,
        }
    
    
      const res = NextResponse.json({ success: true })
        // Set HTTP-only secure cookie
        res.cookies.set({
          name: "session",
          value: JSON.stringify(session),
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 3, // 3 days
          sameSite: "lax",
        })




  

    

    return res
  } catch (error) {
    console.error("Google Auth Error:", error)
    return NextResponse.json(
      { error:  "Google auth failed" },
      { status: 401 }
    )
  }
}
