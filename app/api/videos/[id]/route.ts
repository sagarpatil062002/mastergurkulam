import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { Video } from "@/lib/db-models"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    const videos = await getCollection<Video>("videos")

    const result = await videos.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } },
    )

    return NextResponse.json({ modifiedCount: result.modifiedCount })
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const videos = await getCollection<Video>("videos")
    const result = await videos.deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ deletedCount: result.deletedCount })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}