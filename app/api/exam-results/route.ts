import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { ExamResult, Exam } from "@/lib/db-models"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // "rollnumber" or "email"
    const value = searchParams.get("value")

    if (!type || !value) {
      return NextResponse.json({ error: "Missing search parameters" }, { status: 400 })
    }

    const results = await getCollection<ExamResult>("exam_results")

    let result
    if (type === "rollnumber") {
      result = await results.findOne({ registrationNumber: value })
    } else if (type === "email") {
      result = await results.findOne({ email: value })
    }

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 })
    }

    // Get exam details
    const exams = await getCollection<Exam>("exams")
    const exam = await exams.findOne({ _id: result.exam_id })

    return NextResponse.json({
      ...result,
      exam: exam ? {
        title: exam.title,
        examDate: exam.examDate,
      } : null
    })
  } catch (error) {
    console.error("Result search error:", error)
    return NextResponse.json({ error: "Failed to search results" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const exam_id = new ObjectId(formData.get("exam_id") as string)

    const results = await getCollection<ExamResult>("exam_results")

    const result = await results.insertOne({
      exam_id,
      registrationNumber: formData.get("registrationNumber") as string,
      studentName: formData.get("studentName") as string,
      email: formData.get("email") as string,
      marks: parseInt(formData.get("marks") as string),
      totalMarks: parseInt(formData.get("totalMarks") as string),
      percentage: parseFloat(formData.get("percentage") as string),
      grade: formData.get("grade") as string,
      status: formData.get("status") as "pass" | "fail" | "absent",
      resultFile: formData.get("resultFile") as string || undefined,
      answerBookFile: formData.get("answerBookFile") as string || undefined,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Result creation error:", error)
    return NextResponse.json({ error: "Failed to create result" }, { status: 500 })
  }
}
