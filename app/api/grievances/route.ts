import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email-service"
import type { Grievance, ExamRegistration } from "@/lib/db-models"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const email = formData.get("email") as string
    const registrationNumber = formData.get("registrationNumber") as string

    // Find registration
    const registrations = await getCollection<ExamRegistration>("exam_registrations")
    const registration = await registrations.findOne({
      registrationNumber,
      email,
    })

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    const grievances = await getCollection<Grievance>("grievances")
    const result = await grievances.insertOne({
      exam_id: registration.exam_id,
      registration_id: registration._id!,
      description: formData.get("description") as string,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Send confirmation
    await sendEmail(
      email,
      "Grievance Received",
      `<p>Your grievance has been received and will be reviewed by our team.</p>
       <p>Grievance ID: ${result.insertedId}</p>`,
    )

    return NextResponse.json({ _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Grievance error:", error)
    return NextResponse.json({ error: "Failed to file grievance" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const grievances = await getCollection<Grievance>("grievances")
    const result = await grievances.find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch grievances" }, { status: 500 })
  }
}
