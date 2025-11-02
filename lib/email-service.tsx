import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    // Skip email sending if credentials are not configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log("Email credentials not configured, skipping email send")
      return
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@mastersgurukulam.com",
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error("Email sending failed:", error)
    throw error
  }
}

export function generateConfirmationEmail(data: {
  name: string
  registrationNumber: string
  course: string
  email: string
}): string {
  return `
    <h2>Admission Confirmation</h2>
    <p>Dear ${data.name},</p>
    <p>Thank you for your application to Master's Gurukulam.</p>
    <p><strong>Registration Number:</strong> ${data.registrationNumber}</p>
    <p><strong>Course:</strong> ${data.course}</p>
    <p>We will contact you shortly with further details.</p>
    <p>Best regards,<br>Master's Gurukulam Team</p>
  `
}

export function generateExamConfirmationEmail(data: {
  name: string
  registrationNumber: string
  examTitle: string
  examDate: string
  center: string
  email: string
}): string {
  return `
    <h2>Exam Registration Confirmed</h2>
    <p>Dear ${data.name},</p>
    <p>Your registration for the exam has been confirmed.</p>
    <p><strong>Registration Number:</strong> ${data.registrationNumber}</p>
    <p><strong>Exam:</strong> ${data.examTitle}</p>
    <p><strong>Date:</strong> ${data.examDate}</p>
    <p><strong>Center:</strong> ${data.center}</p>
    <p>Please keep your registration number safe.</p>
    <p>Best regards,<br>Master's Gurukulam Team</p>
  `
}
