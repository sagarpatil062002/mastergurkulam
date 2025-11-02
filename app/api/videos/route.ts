import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"

interface Video {
  _id?: string
  title: string
  url: string
  type: "youtube" | "upload"
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export async function GET() {
  try {
    const videos = await getCollection<Video>("videos")
    const result = await videos.find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Videos fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const videos = await getCollection<Video>("videos")

    // If setting as active, deactivate all others
    if (data.active) {
      await videos.updateMany({}, { $set: { active: false } })
    }

    const result = await videos.insertOne({
      title: data.title,
      url: data.url,
      type: data.type,
      active: data.active || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Video creation error:", error)
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
  }
}