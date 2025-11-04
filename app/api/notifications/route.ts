import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { Notification } from "@/lib/db-models"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const notifications = await getCollection<Notification>("notifications")

    // Get active notifications within date range
    const now = new Date()
    const activeNotifications = await notifications
      .find({
        active: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(activeNotifications)
  } catch (error) {
    console.error("Fetch notifications error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, message, type, startDate, endDate } = await request.json()

    const notifications = await getCollection<Notification>("notifications")

    const result = await notifications.insertOne({
      title,
      message,
      type: type || "info",
      active: true,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Create notification error:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}