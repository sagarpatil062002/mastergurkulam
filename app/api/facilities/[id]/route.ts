import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { Facility } from "@/lib/db-models"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const facilities = await getCollection<Facility>("facilities")

    const result = await facilities.updateOne(
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
    const facilities = await getCollection<Facility>("facilities")
    const result = await facilities.deleteOne({ _id: new ObjectId(params.id) })

    return NextResponse.json({ deletedCount: result.deletedCount })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
