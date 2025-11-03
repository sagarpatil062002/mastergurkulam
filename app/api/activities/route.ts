import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { Activity } from "@/lib/db-models"

// GET all active activities
export async function GET(request: NextRequest) {
  try {
    const activities = await getCollection<Activity>("activities")
    const result = await activities.find({ active: true }).sort({ date: -1 }).toArray()

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Fetch activities error:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}

// POST create activity (admin only)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const activities = await getCollection<Activity>("activities")

    const result = await activities.insertOne({
      ...data,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ _id: result.insertedId, ...data }, { status: 201 })
  } catch (error) {
    console.error("Create activity error:", error)
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 })
  }
}
