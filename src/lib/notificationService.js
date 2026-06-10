// src/lib/notificationService.js  (Next.js)
//
// Drop-in replacement. Same function signatures as before.
// After MongoDB write, fires a real-time push to the chat server (best-effort).
// If the chat server is down or the user is offline, fails silently —
// the notification still lives in MongoDB and appears on next bell open.

import dbConnect              from "@/lib/dbConnect"
import { Notification }       from "@/models/notification.model"
import { User }               from "@/models/users.model"

// ── Internal real-time push ─────────────────────────────────────────────────
async function pushRealtime(userId, notification) {
  const url    = process.env.CHAT_SERVER_INTERNAL_URL
  const secret = process.env.INTERNAL_NOTIFY_SECRET

  if (!url || !secret) {
    // Env vars not set — skip silently (works in dev without chat server)
    return
  }

  try {
    await fetch(`${url}/internal/notify`, {
      method:  "POST",
      headers: {
        "Content-Type":      "application/json",
        "X-Internal-Secret": secret,
      },
      body: JSON.stringify({
        userId: userId.toString(),
        notification: {
          _id:       notification._id.toString(),
          title:     notification.title,
          message:   notification.message,
          type:      notification.type,
          data:      notification.data,
          read:      notification.read,
          createdAt: notification.createdAt,
        },
      }),
      // 3-second timeout — never block the parent route
      signal: AbortSignal.timeout(3000),
    })
  } catch {
    // Timeout / network error / chat server down — all non-fatal
  }
}

// ── sendNotification ────────────────────────────────────────────────────────
/**
 * Save a notification to MongoDB then push via Socket.IO (best-effort).
 *
 * @param {{ userId: ObjectId, title: string, message: string, type: string, data?: object }} opts
 */
export async function sendNotification({ userId, title, message, type, data = {} }) {
  try {
    await dbConnect()

    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      data,
    })

    // Fire-and-forget — does NOT await, does NOT throw on failure
    pushRealtime(userId, notification)

    return notification
  } catch (err) {
    console.error("[sendNotification] error:", err)
    return null
  }
}

// ── broadcastNotification ───────────────────────────────────────────────────
/**
 * Send to all non-banned, non-guest users.
 * Real-time push fires in parallel for all users.
 *
 * @param {{ title: string, message: string, type?: string, data?: object }} opts
 */
export async function broadcastNotification({ title, message, type = "announcement", data = {} }) {
  try {
    await dbConnect()

    const users = await User.find(
      { isBanned: false, provider: { $ne: "guest" } },
      { _id: 1 }
    ).lean()

    const docs = users.map((u) => ({
      user:    u._id,
      title,
      message,
      type,
      data,
      read:    false,
    }))

    const inserted = await Notification.insertMany(docs)

    // Push real-time to all users concurrently (non-blocking per-user)
    inserted.forEach((notif) => pushRealtime(notif.user, notif))
  } catch (err) {
    console.error("[broadcastNotification] error:", err)
  }
}