import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { ExamRegistration, Exam } from "@/lib/db-models"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const registrationNumber = searchParams.get("registrationNumber")

    if (!registrationNumber) {
      return NextResponse.json({ error: "Registration number required" }, { status: 400 })
    }

    const registrations = await getCollection<ExamRegistration>("exam_registrations")
    const registration = await registrations.findOne({ registrationNumber })

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    if (registration.paymentStatus !== "completed") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    // Get exam details
    const exams = await getCollection<Exam>("exams")
    const exam = await exams.findOne({ _id: registration.exam_id })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Check if exam date is within 7 days
    const examDate = new Date(exam.examDate)
    const now = new Date()
    const daysUntilExam = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExam > 7) {
      return NextResponse.json({ error: "Hall ticket will be available 7 days before exam" }, { status: 400 })
    }

    return NextResponse.json({
      ...registration,
      exam: {
        title: exam.title,
        examDate: exam.examDate,
        examFee: exam.examFee,
        centers: exam.centers,
        languages: exam.languages,
      },
      hallTicketAvailable: true,
    })
  } catch (error) {
    console.error("Hall ticket fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch hall ticket" }, { status: 500 })
  }
}