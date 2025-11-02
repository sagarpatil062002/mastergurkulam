import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { Course } from "@/lib/db-models"

// GET all active courses
export async function GET(request: NextRequest) {
  try {
    const courses = await getCollection<Course>("courses")
    const result = await courses.find({ active: true }).sort({ order: 1 }).toArray()

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Fetch courses error:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

// POST create course (admin only)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const courses = await getCollection<Course>("courses")

    const result = await courses.insertOne({
      ...data,
      slug: data.title.toLowerCase().replace(/\s+/g, "-"),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ _id: result.insertedId, ...data }, { status: 201 })
  } catch (error) {
    console.error("Create course error:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
