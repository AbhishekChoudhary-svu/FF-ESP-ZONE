import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/users.model"
import { signSession } from "@/lib/session"

export async function POST(req) {
  try {
    const { userInfo } = await req.json()

    if (!userInfo?.sub || !userInfo?.email) {
      return NextResponse.json({ error: "Invalid Google user info" }, { status: 400 })
    }

    if (!userInfo.email_verified) {
      return NextResponse.json({ error: "Google email not verified" }, { status: 401 })
    }

    await dbConnect()

    let user = await User.findOne({ uid: userInfo.sub })

    if (!user) {
      const emailExists = await User.findOne({ email: userInfo.email })
      if (emailExists) {
        return NextResponse.json(
          { error: "Email already registered with a different method" },
          { status: 409 }
        )
      }

      user = await User.create({
        uid: userInfo.sub,
        email: userInfo.email,
        username: userInfo.name || userInfo.email.split("@")[0],
        ffUid: userInfo.sub,
        emailVerified: true,
        role: "user",
        plan: "basic",
        provider: "google",
        sessionVersion: 1,
        password: "",
      })
    }

    const session = {
      uid: user.uid,
      email: user.email,
      sessionVersion: user.sessionVersion ?? 1,
    }

    const res = NextResponse.json({ success: true })

    res.cookies.set({
      name: "session",
      value: signSession(session),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 3,
      sameSite: "lax",
    })

    return res
  } catch (error) {
    console.error("Google Auth Error:", error)
    return NextResponse.json({ error: error.message || "Google auth failed" }, { status: 401 })
  }
}