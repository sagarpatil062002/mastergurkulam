import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { Faculty } from "@/lib/db-models"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const faculty = await getCollection<Faculty>("faculty")

    const result = await faculty.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { ...data, updatedAt: new Date() } },
    )

    return NextResponse.json({ modifiedCount: result.modifiedCount })
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const faculty = await getCollection<Faculty>("faculty")
    const result = await faculty.deleteOne({ _id: new ObjectId(params.id) })

    return NextResponse.json({ deletedCount: result.deletedCount })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
