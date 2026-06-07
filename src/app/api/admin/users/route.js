import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { User } from "@/models/users.model"
import { verifySession } from "@/lib/session"

async function requireAdmin(req) {
  const raw = req.cookies.get("session")?.value
  if (!raw) return null
  const session = verifySession(raw)
  if (!session?.uid) return null
  const user = await User.findOne({ uid: session.uid }).lean()
  if (!["admin", "moderator"].includes(user?.role)) return null
  return user
}

export async function GET(req) {
  await dbConnect()
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const users = await User.find({ provider: { $ne: "guest" } })
    .select("-password -otp -otpExpiresAt")
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json({ success: true, users })
}

export async function PATCH(req) {
  await dbConnect()
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { uid, action, role, banReason } = await req.json()
  if (!uid || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  // Prevent self-modification
  if (uid === admin.uid) return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 })

  const updates = {}
  if (action === "ban")   { updates.isBanned = true;  updates.banReason = banReason || "Banned by admin"; updates.$inc = { sessionVersion: 1 } }
  if (action === "unban") { updates.isBanned = false; updates.banReason = "" }
  if (action === "role")  {
    if (!["user", "moderator", "admin"].includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    if (role === "admin" && admin.role !== "admin") return NextResponse.json({ error: "Only admins can promote to admin" }, { status: 403 })
    updates.role = role
    updates.$inc = { sessionVersion: 1 }
  }

  const { $inc, ...setUpdates } = updates
  const mongoUpdate = { $set: setUpdates }
  if ($inc) mongoUpdate.$inc = $inc

  await User.updateOne({ uid }, mongoUpdate)
  return NextResponse.json({ success: true })
}