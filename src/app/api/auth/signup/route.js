import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebaseAdmin"
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/users.model"
import { sendEmail } from "@/lib/emailService"
import verificationEmailTemplate from "@/utils/verifyEmailTemplete"

export async function POST(req) {
  try {
    const { email, password, username, ffUid } = await req.json()

   
    if (!email || !password || !username || !ffUid) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

   
    await dbConnect()

    const exists = await User.findOne({
      $or: [{ email }, { username }, { ffUid }],
    })

    if (exists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      )
    }

    
    const firebaseUser = await adminAuth.createUser({
      email,
      password,
      emailVerified: false,
    })

    try {
      
      const verifyLink =
        await adminAuth.generateEmailVerificationLink(email)

      
      await sendEmail({
        to: email,
        subject: "Verify your email - FF-ESP-ZONE",
        text: "Verify your email to activate your FF-ESP-ZONE account.",
        html: verificationEmailTemplate(username, ffUid, verifyLink),
      })

     
      const user = await User.create({
        uid: firebaseUser.uid,
        email,
        username,
        ffUid,
        emailVerified: false,
        provider: "password",
        role: "user",
        plan: "basic",
        isBanned: false,
        createdAt: new Date(),
      })

      
      return NextResponse.json(
        {
          success: true,
          message: "Signup successful. Verify your email.",
          user: {
            uid: user.uid,
            email: user.email,
            username: user.username,
          },
        },
        { status: 201 }
      )
    } catch (err) {
      
      await adminAuth.deleteUser(firebaseUser.uid)
      throw err
    }
  } catch (err) {
    console.error("Signup error:", err)

    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    )
  }
}
