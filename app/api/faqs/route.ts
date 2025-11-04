import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { FAQ } from "@/lib/db-models"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId")

    const faqs = await getCollection<FAQ>("faqs")

    if (examId) {
      const examFAQs = await faqs.find({ examId: new ObjectId(examId), active: true }).sort({ order: 1 }).toArray()
      return NextResponse.json(examFAQs)
    }

    const allFAQs = await faqs.find({ active: true }).sort({ order: 1 }).toArray()
    return NextResponse.json(allFAQs)
  } catch (error) {
    console.error("Fetch FAQs error:", error)
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question, answer, examId, order = 0 } = await request.json()

    const faqs = await getCollection<FAQ>("faqs")

    const result = await faqs.insertOne({
      question,
      answer,
      examId: examId ? new ObjectId(examId) : undefined,
      order,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Create FAQ error:", error)
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 })
  }
}