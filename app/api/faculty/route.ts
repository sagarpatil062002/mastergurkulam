import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { Faculty } from "@/lib/db-models"

export async function GET(request: NextRequest) {
  try {
    const faculty = await getCollection<Faculty>("faculty")
    const result = await faculty.find({ active: true }).sort({ order: 1 }).toArray()

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Fetch faculty error:", error)
    return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const faculty = await getCollection<Faculty>("faculty")

    const result = await faculty.insertOne({
      ...data,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ _id: result.insertedId, ...data }, { status: 201 })
  } catch (error) {
    console.error("Create faculty error:", error)
    return NextResponse.json({ error: "Failed to create faculty" }, { status: 500 })
  }
}
