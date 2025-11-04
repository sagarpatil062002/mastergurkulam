import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { sendEmail, generateExamConfirmationEmail } from "@/lib/email-service"
import type { ExamRegistration, Exam } from "@/lib/db-models"
import { ObjectId } from "mongodb"
import { syncContactToCRM, createCRMDeal } from "@/lib/crm-integration"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const exam_id = new ObjectId(formData.get("exam_id") as string)

    // Get exam details for email
    const exams = await getCollection<Exam>("exams")
    const exam = await exams.findOne({ _id: exam_id })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    const registrations = await getCollection<ExamRegistration>("exam_registrations")

    // Generate registration number
    const registrationNumber = `REG-${exam_id.toString().slice(0, 8)}-${Date.now()}`

    const paymentMethod = formData.get("paymentMethod") as string || "gateway"

    const result = await registrations.insertOne({
      exam_id,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      mobile: formData.get("mobile") as string,
      dob: formData.get("dob") as string,
      center: formData.get("center") as string,
      language: formData.get("language") as string,
      examFee: parseInt(formData.get("examFee") as string) || exam.examFee,
      paymentStatus: paymentMethod === "gateway" ? "pending" : "pending_cash",
      paymentMethod: paymentMethod as "gateway" | "cash",
      confirmationEmailSent: false,
      registrationNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Send confirmation email to student
    await sendEmail(
      formData.get("email") as string,
      `Exam Registration Confirmed - ${exam.title}`,
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Exam Registration Confirmed!</h2>
        <p>Dear ${formData.get("name")},</p>
        <p>Your registration for <strong>${exam.title}</strong> has been successfully confirmed.</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Registration Details:</h3>
          <p><strong>Registration Number:</strong> ${registrationNumber}</p>
          <p><strong>Exam:</strong> ${exam.title}</p>
          <p><strong>Exam Date:</strong> ${new Date(exam.examDate).toLocaleDateString()}</p>
          <p><strong>Center:</strong> ${formData.get("center")}</p>
          <p><strong>Language:</strong> ${formData.get("language")}</p>
          <p><strong>Fee Paid:</strong> ₹${exam.examFee}</p>
        </div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h4 style="margin: 0 0 10px 0; color: #92400e;">Important Instructions:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #92400e;">
            <li>Your hall ticket will be sent 7 days before the exam</li>
            <li>Keep your registration number safe for future reference</li>
            <li>Check your email regularly for updates</li>
            <li>Contact us if you have any questions</li>
          </ul>
        </div>

        <p>Best regards,<br>Master's Gurukulam Team</p>
      </div>`
    )

    // Sync to CRM if enabled
    try {
      const contactId = await syncContactToCRM({
        email: formData.get("email") as string,
        name: formData.get("name") as string,
        mobile: formData.get("mobile") as string,
        source: 'exam_registration',
        examInterest: exam.title,
        status: 'qualified',
        notes: `Exam registration: ${exam.title}, Center: ${formData.get("center")}, Fee: ₹${exam.examFee}`
      })

      // Create deal for exam registration
      if (contactId) {
        await createCRMDeal({
          title: `${exam.title} Registration - ${formData.get("name")}`,
          contactId,
          amount: exam.examFee,
          currency: 'INR',
          stage: 'qualified',
          examType: exam.title,
          closeDate: new Date(exam.examDate)
        })
      }
    } catch (crmError) {
      console.error('CRM sync error:', crmError)
      // Don't fail registration if CRM sync fails
    }

    return NextResponse.json({ _id: result.insertedId, registrationNumber }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const registrationNumber = searchParams.get("registrationNumber")

    const registrations = await getCollection<ExamRegistration>("exam_registrations")

    if (registrationNumber) {
      // Fetch specific registration with exam details
      const registration = await registrations.findOne({ registrationNumber })

      if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 })
      }

      // Get exam details
      const exams = await getCollection<Exam>("exams")
      const exam = await exams.findOne({ _id: registration.exam_id })

      return NextResponse.json({
        ...registration,
        exam: exam ? {
          title: exam.title,
          examDate: exam.examDate,
          examFee: exam.examFee,
        } : null
      })
    } else {
      // Fetch all registrations
      const result = await registrations.find({}).sort({ createdAt: -1 }).toArray()
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}
