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
      console.log("📧 Email credentials not configured, logging email instead of sending:")
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`HTML Content Preview: ${html.substring(0, 200)}...`)
      console.log("Full HTML Content:", html)
      return { success: true, mode: 'logged', to, subject }
    }

    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@mastersgurukulam.com",
      to,
      subject,
      html,
    })

    console.log("📧 Email sent successfully:", { to, subject, messageId: result.messageId })
    return { success: true, mode: 'sent', to, subject, messageId: result.messageId }
  } catch (error) {
    console.error("❌ Email sending failed:", error)
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

export function generateHallTicketEmail(data: {
  name: string
  registrationNumber: string
  examTitle: string
  examDate: string
  center: string
  language: string
  email: string
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Your Hall Ticket is Ready!</h2>
      <p>Dear ${data.name},</p>
      <p>Your hall ticket for the upcoming exam has been generated. Please find the details below:</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Exam Details:</h3>
        <p><strong>Registration Number:</strong> ${data.registrationNumber}</p>
        <p><strong>Exam:</strong> ${data.examTitle}</p>
        <p><strong>Date:</strong> ${data.examDate}</p>
        <p><strong>Center:</strong> ${data.center}</p>
        <p><strong>Language:</strong> ${data.language}</p>
      </div>

      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h4 style="margin: 0 0 10px 0; color: #92400e;">Important Instructions:</h4>
        <ul style="margin: 0; padding-left: 20px; color: #92400e;">
          <li>Arrive at the exam center at least 30 minutes before the scheduled time</li>
          <li>Bring a valid photo ID proof along with this hall ticket</li>
          <li>Electronic devices are not allowed in the exam hall</li>
          <li>Follow all instructions given by the exam invigilators</li>
        </ul>
      </div>

      <p>You can also download your hall ticket from our website using your registration number.</p>
      <p>Best regards,<br>Master's Gurukulam Team</p>
    </div>
  `
}

export function generateGrievanceStatusUpdateEmail(data: {
  name: string
  grievanceId: string
  status: string
  description: string
  email: string
}): string {
  const statusColors = {
    pending: '#f59e0b',
    resolved: '#10b981',
    rejected: '#ef4444'
  }

  const statusText = data.status.charAt(0).toUpperCase() + data.status.slice(1)

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Grievance Status Update</h2>
      <p>Dear Student,</p>
      <p>We have updated the status of your grievance. Here are the details:</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Grievance Details:</h3>
        <p><strong>Grievance ID:</strong> ${data.grievanceId}</p>
        <p><strong>Description:</strong> ${data.description}</p>
        <p><strong>Status:</strong> <span style="color: ${statusColors[data.status as keyof typeof statusColors] || '#6b7280'}; font-weight: bold;">${statusText}</span></p>
        <p><strong>Updated on:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      ${data.status === 'resolved' ? `
        <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="margin: 0; color: #065f46;">Your grievance has been resolved. If you have any further concerns, please contact us.</p>
        </div>
      ` : data.status === 'rejected' ? `
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p style="margin: 0; color: #991b1b;">Your grievance has been reviewed and unfortunately could not be resolved at this time. Please contact us for more information.</p>
        </div>
      ` : `
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;">Your grievance is still under review. We will update you once there is further progress.</p>
        </div>
      `}

      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>Master's Gurukulam Support Team</p>
    </div>
  `
}
