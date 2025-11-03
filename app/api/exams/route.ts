import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { Exam } from "@/lib/db-models"

// GET all active exams
export async function GET(request: NextRequest) {
  try {
    const exams = await getCollection<Exam>("exams")
    const result = await exams.find({ active: true }).sort({ examDate: 1 }).toArray()

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Fetch exams error:", error)
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 })
  }
}

// POST create exam (admin only)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const exams = await getCollection<Exam>("exams")

    const result = await exams.insertOne({
      ...data,
      slug: data.title.toLowerCase().replace(/\s+/g, "-"),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ _id: result.insertedId, ...data }, { status: 201 })
  } catch (error) {
    console.error("Create exam error:", error)
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 })
  }
}
