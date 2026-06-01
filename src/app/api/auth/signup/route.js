import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/users.model"
import { sendEmail } from "@/lib/emailService"
import verificationEmailTemplate from "@/utils/verifyEmailTemplete"
import { checkSignupLimit } from "@/lib/rateLimit"

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for") ??
             req.headers.get("x-real-ip") ??
             "unknown"

  try {
    // Rate limit — max 5 signups per IP per hour
    await checkSignupLimit(ip)

    const { email, password, username, ffUid } = await req.json()

    if (!email || !password || !username || !ffUid) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    await dbConnect()

    const exists = await User.findOne({
      $or: [{ email }, { username }, { ffUid }],
    })

    if (exists) {
      // Don't reveal which field exists — security best practice
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const uid = crypto.randomUUID()

    // Generate OTP and hash it before storing
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOtp = await bcrypt.hash(rawOtp, 8) // lower rounds — OTP is short-lived
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await User.create({
      uid,
      email,
      password: hashedPassword,
      username,
      ffUid,
      emailVerified: false,
      provider: "password",
      role: "user",
      plan: "basic",
      isBanned: false,
      sessionVersion: 1,
      otp: hashedOtp,       // store hashed OTP, never plain text
      otpExpiresAt,
    })

    const emailResult = await sendEmail({
      to: email,
      subject: "Verify your email - FF-ESP-ZONE",
      text: `Your verification code is: ${rawOtp}`,
      html: verificationEmailTemplate(username, ffUid, rawOtp), // send raw to user
    })

    if (!emailResult.success) {
      // Delete user if email fails — don't leave unverifiable accounts
      await User.deleteOne({ uid })
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Signup successful. Check your email for the OTP.",
        user: { uid, email, username },
      },
      { status: 201 }
    )
  } catch (err) {
    if (err.message?.includes("Too many")) {
      return NextResponse.json({ error: err.message }, { status: 429 })
    }
    console.error("Signup error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}