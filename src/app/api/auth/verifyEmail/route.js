import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/users.model"
import { sendEmail } from "@/lib/emailService"
import verificationEmailTemplate from "@/utils/verifyEmailTemplete"
import { checkOtpVerifyLimit, checkOtpLimit, resetOtpVerifyLimit } from "@/lib/rateLimit"

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for") ??
             req.headers.get("x-real-ip") ??
             "unknown"

  try {
    const { email, action, otp } = await req.json()

    if (!email || !action) {
      return NextResponse.json({ error: "Email and action are required" }, { status: 400 })
    }

    await dbConnect()
    const user = await User.findOne({ email })

    // Always return same error whether user exists or not — prevents email enumeration
    if (!user) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    if (action === "verify") {
      if (!otp) {
        return NextResponse.json({ error: "OTP is required" }, { status: 400 })
      }

      // Rate limit OTP attempts — max 5 wrong attempts per IP
      await checkOtpVerifyLimit(ip)

      if (user.emailVerified) {
        return NextResponse.json({ success: true, verified: true, message: "Already verified" })
      }

      if (!user.otp || !user.otpExpiresAt) {
        return NextResponse.json({ error: "No OTP found, request a new one" }, { status: 400 })
      }

      if (new Date() > user.otpExpiresAt) {
        // Clear expired OTP from DB
        user.otp = null
        user.otpExpiresAt = null
        await user.save()
        return NextResponse.json({ error: "OTP expired, request a new one" }, { status: 400 })
      }

      // Compare against hashed OTP in DB
      const otpMatch = await bcrypt.compare(otp.toString(), user.otp)
      if (!otpMatch) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
      }

      // OTP correct — verify and clean up
      user.emailVerified = true
      user.otp = null
      user.otpExpiresAt = null
      await user.save()

      // Reset brute force counter on success
      await resetOtpVerifyLimit(ip)

      return NextResponse.json({
        success: true,
        verified: true,
        message: "Email verified successfully",
      })
    }

    if (action === "resend") {
      // Rate limit resend — max 3 per email per hour
      await checkOtpLimit(email)

      if (user.emailVerified) {
        return NextResponse.json({ success: true, message: "Email already verified" })
      }

      // Prevent resend spam — enforce 60 second cooldown
      if (user.otpExpiresAt) {
        const otpAge = new Date(user.otpExpiresAt) - new Date()
        const cooldownRemaining = otpAge - (9 * 60 * 1000) // 9 min left means sent < 1 min ago
        if (cooldownRemaining > 0) {
          return NextResponse.json(
            { error: "Please wait before requesting a new OTP" },
            { status: 429 }
          )
        }
      }

      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString()
      const hashedOtp = await bcrypt.hash(rawOtp, 8)
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

      user.otp = hashedOtp
      user.otpExpiresAt = otpExpiresAt
      await user.save()

      const emailResult = await sendEmail({
        to: email,
        subject: "Verify your email - FF-ESP-ZONE",
        text: `Your verification code is: ${rawOtp}`,
        html: verificationEmailTemplate(user.username, user.ffUid, rawOtp),
      })

      if (!emailResult.success) {
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "New OTP sent to your email" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (err) {
    if (err.message?.includes("Too many")) {
      return NextResponse.json({ error: err.message }, { status: 429 })
    }
    console.error("Email verification error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}