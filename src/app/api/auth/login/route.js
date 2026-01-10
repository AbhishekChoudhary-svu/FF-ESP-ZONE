import { NextResponse } from "next/server"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase" 
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/users.model"

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    let firebaseUser
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      firebaseUser = userCredential.user
    } catch (err) {
      return NextResponse.json(
        { error: err.message || "Invalid credentials" },
        { status: 401 }
      )
    }

    await dbConnect()
    const user = await User.findOne({ uid: firebaseUser.uid })
    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      )
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 403 }
      )
    }

    const session = {
      uid: user.uid,
      email: user.email,
      role: user.role || "user",
      emailVerified: user.emailVerified,
    }

    const res = NextResponse.json({ success: true, user })

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
  } catch (err) {
    console.error("Login API error:", err)
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    )
  }
}
