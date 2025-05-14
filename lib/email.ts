import nodemailer from "nodemailer"

// Create a test account if we're in development
let testAccount: nodemailer.TestAccount | null = null

// Initialize transporter
let transporter: nodemailer.Transporter | null = null

// Initialize the email transporter
export async function initEmailTransporter() {
  // If we already have a transporter, return it
  if (transporter) return transporter

  // Check if we have SMTP settings in environment variables
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Create a transporter with the provided SMTP settings
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    console.log("Email transporter initialized with SMTP settings")
    return transporter
  }

  // If we're in development and don't have SMTP settings, use Ethereal
  if (process.env.NODE_ENV === "development") {
    // Create a test account on Ethereal if we don't have one
    if (!testAccount) {
      try {
        testAccount = await nodemailer.createTestAccount()
        console.log("Created test email account:", testAccount)
      } catch (error) {
        console.error("Failed to create test email account:", error)
        return null
      }
    }

    // Create a transporter with the test account
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })

    console.log("Email transporter initialized with Ethereal")
    return transporter
  }

  console.warn("No email configuration found. Email sending will not work.")
  return null
}

// Send an email
export async function sendEmail(options: {
  to: string
  subject: string
  text?: string
  html?: string
}) {
  // Initialize the transporter if it doesn't exist
  const emailTransporter = await initEmailTransporter()

  if (!emailTransporter) {
    console.error("Email transporter not initialized")
    return { success: false, error: "Email transporter not initialized" }
  }

  try {
    // Send the email
    const info = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || '"B2B Marketplace" <noreply@example.com>',
      ...options,
    })

    // Log the result
    if (process.env.NODE_ENV === "development" && testAccount) {
      console.log("Email sent:", info)
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info))
    } else {
      console.log("Email sent:", info.messageId)
    }

    return { success: true, info }
  } catch (error) {
    console.error("Failed to send email:", error)
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

// Send an order confirmation email
export async function sendOrderConfirmationEmail(order: any, user: any) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  const orderUrl = `${baseUrl}/orders/${order._id}`

  // Format the order items
  const itemsHtml = order.items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">$${(item.price / 100).toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">$${((item.price * item.quantity) / 100).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("")

  return sendEmail({
    to: user.email,
    subject: `Order Confirmation #${order._id}`,
    html: `
      <h1>Order Confirmation</h1>
      <p>Hello ${user.name || user.email},</p>
      <p>Thank you for your order. Your order has been received and is being processed.</p>
      
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <p><strong>Total:</strong> $${(order.total / 100).toFixed(2)}</p>
      
      <h3>Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Product</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Quantity</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Price</th>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align: right; padding: 10px;"><strong>Total:</strong></td>
            <td style="padding: 10px;"><strong>$${(order.total / 100).toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
      
      <p>You can view your order details <a href="${orderUrl}">here</a>.</p>
      
      <p>Thank you for shopping with us!</p>
    `,
  })
}

export default {
  initEmailTransporter,
  sendEmail,
  sendVerificationEmail,
  sendOrderConfirmationEmail,
}
