import crypto from "crypto"

const SECRET = process.env.SESSION_SECRET

export function signSession(data) {
  const payload = JSON.stringify(data)
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex")
  return `${Buffer.from(payload).toString("base64")}.${sig}`
}

export function verifySession(cookie) {
  try {
    const [b64, sig] = cookie.split(".")
    const payload = Buffer.from(b64, "base64").toString()
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(payload)
      .digest("hex")
    if (sig !== expected) return null
    return JSON.parse(payload)
  } catch {
    return null
  }
}