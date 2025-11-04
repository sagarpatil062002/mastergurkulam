import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { sendEmail, generateGrievanceStatusUpdateEmail } from "@/lib/email-service"
import type { Grievance, ExamRegistration } from "@/lib/db-models"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    const grievances = await getCollection<Grievance>("grievances")

    // Get grievance before update to check status change
    const grievanceBefore = await grievances.findOne({ _id: new ObjectId(id) })

    const result = await grievances.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } },
    )

    // Send status update email if status changed
    if (result.modifiedCount > 0 && grievanceBefore && data.status && grievanceBefore.status !== data.status) {
      // Get registration details for email
      const registrations = await getCollection<ExamRegistration>("exam_registrations")
      const registration = await registrations.findOne({ _id: grievanceBefore.registration_id })

      if (registration) {
        await sendEmail(
          registration.email,
          "Grievance Status Update - Master's Gurukulam",
          generateGrievanceStatusUpdateEmail({
            name: registration.name,
            grievanceId: id,
            status: data.status,
            description: grievanceBefore.description,
            email: registration.email,
          }),
        )
      }
    }

    return NextResponse.json({ modifiedCount: result.modifiedCount })
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const grievances = await getCollection<Grievance>("grievances")
    const result = await grievances.deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ deletedCount: result.deletedCount })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
