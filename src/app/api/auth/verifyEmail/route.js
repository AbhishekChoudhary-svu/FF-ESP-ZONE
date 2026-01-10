import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebaseAdmin"
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/users.model"
import { sendEmail } from "@/lib/emailService"
import verificationEmailTemplate from "@/utils/verifyEmailTemplete"

export async function POST(req) {
  try {
    const { email, action } = await req.json()

    if (!email || !action) {
      return NextResponse.json(
        { error: "Email and action are required" },
        { status: 400 }
      )
    }

   
    await dbConnect()

    
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    
    const firebaseUser = await adminAuth.getUserByEmail(email)

    
    if (action === "resend") {
      if (firebaseUser.emailVerified || user.emailVerified) {
        return NextResponse.json({
          success: true,
          message: "Email already verified",
        })
      }

      const verifyLink =
        await adminAuth.generateEmailVerificationLink(email)

      const emailResult = await sendEmail({
        to: email,
        subject: "Verify your email - FF-ESP-ZONE",
        text: "Verify your email to activate your FF-ESP-ZONE account.",
        html: verificationEmailTemplate(
          user.username,
          user.ffUid,
          verifyLink
        ),
      })

      if (!emailResult.success) {
        return NextResponse.json(
          { error: "Failed to send verification email" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "Verification email sent",
      })
    }

   
    if (action === "check") {
      if (!firebaseUser.emailVerified) {
        return NextResponse.json({
          verified: false,
          message: "Email not verified yet",
        })
      }

     
      if (!user.emailVerified) {
        user.emailVerified = true
        await user.save()
      }

      return NextResponse.json({
        success: true,
        verified: true,
        message: "Email verified successfully",
        user: {
          uid: user.uid,
          email: user.email,
          username: user.username,
          ffUid: user.ffUid,
          emailVerified: true,
        },
      })
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  } catch (err) {
    console.error("Email verification error:", err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
