import { Resend } from "resend"

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Send an email using Resend
export async function sendEmail(options: {
  to: string
  subject: string
  text?: string
  html?: string
}) {
  if (!resend) {
    console.warn("Resend API key not found. Email sending will not work.")
    return { success: false, error: "Resend API key not found" }
  }

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || "B2B Marketplace <noreply@example.com>",
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    console.log("Email sent with Resend:", result)
    return { success: true, info: result }
  } catch (error) {
    console.error("Failed to send email with Resend:", error)
    return { success: false, error }
  }
}

// Send a verification email
export async function sendVerificationEmail(user: {
  email: string
  verificationToken?: string
  name?: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  const verificationUrl = `${baseUrl}/verify-email?token=${user.verificationToken}`

  return sendEmail({
    to: user.email,
    subject: "Verify your email address",
    html: `
      <h1>Welcome to B2B Marketplace!</h1>
      <p>Hello ${user.name || "there"},</p>
      <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email Address</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
    `,
  })
}

export default {
  sendEmail,
  sendVerificationEmail,
}
