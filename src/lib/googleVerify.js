import { OAuth2Client } from "google-auth-library"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()

  if (!payload) throw new Error("Invalid Google token")
  if (!payload.email_verified) throw new Error("Google email not verified")

  return {
    uid: payload.sub,
    email: payload.email,
    name: payload.name,
    emailVerified: payload.email_verified,
  }
}