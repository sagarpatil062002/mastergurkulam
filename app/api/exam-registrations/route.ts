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
      paymentMethod,
      confirmationEmailSent: false,
      registrationNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Send confirmation email
    await sendEmail(
      formData.get("email") as string,
      "Exam Registration Confirmed",
      generateExamConfirmationEmail({
        name: formData.get("name") as string,
        registrationNumber,
        examTitle: exam.title,
        examDate: new Date(exam.examDate).toLocaleDateString(),
        center: formData.get("center") as string,
        email: formData.get("email") as string,
      }),
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
