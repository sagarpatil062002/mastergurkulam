import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { Facility } from "@/lib/db-models"

export async function GET(request: NextRequest) {
  try {
    const facilities = await getCollection<Facility>("facilities")
    const result = await facilities.find({ active: true }).sort({ order: 1 }).toArray()

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Fetch facilities error:", error)
    return NextResponse.json({ error: "Failed to fetch facilities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const facilities = await getCollection<Facility>("facilities")

    const result = await facilities.insertOne({
      ...data,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ _id: result.insertedId, ...data }, { status: 201 })
  } catch (error) {
    console.error("Create facility error:", error)
    return NextResponse.json({ error: "Failed to create facility" }, { status: 500 })
  }
}
