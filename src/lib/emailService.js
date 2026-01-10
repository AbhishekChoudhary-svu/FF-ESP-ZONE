import nodemailer from "nodemailer"

export async function sendEmail({ to, subject, text, html }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER, // your@gmail.com
        pass: process.env.EMAIL_PASS, // App Password (NOT Gmail password)
      },
    })

    const info = await transporter.sendMail({
      from: `"FF-ESP-ZONE" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    })

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error("Email send error:", error)

    return {
      success: false,
      error: error.message,
    }
  }
}
