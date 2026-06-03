import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? "FF-ESP-ZONE <onboarding@resend.dev>"

export async function sendEmail({ to, subject, html, text }) {
  // In development, redirect all emails to test address to avoid Resend domain restriction
  const recipient =
    process.env.NODE_ENV !== "production" && process.env.TEST_EMAIL
      ? process.env.TEST_EMAIL
      : to

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: recipient,
      subject,
      html,
      text,
    })

    if (error) {
      console.error("Resend error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data.id }
  } catch (err) {
    console.error("Email service error:", err)
    return { success: false, error: err.message }
  }
}