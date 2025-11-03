import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email-service"
import type { Contact } from "@/lib/db-models"

// POST contact form submission
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const contacts = await getCollection<Contact>("contacts")

    const result = await contacts.insertOne({
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      message: data.message,
      type: data.type || "general",
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Send confirmation email to user
    await sendEmail(
      data.email,
      "We received your message",
      `<p>Dear ${data.name},</p><p>Thank you for contacting Master's Gurukulam. We will get back to you soon.</p>`,
    )

    // Send notification to admin
    await sendEmail(
      process.env.ADMIN_EMAIL || "admin@mastersgurukulam.com",
      `New Contact: ${data.name}`,
      `<p>New contact from ${data.name} (${data.email})</p><p>${data.message}</p>`,
    )

    return NextResponse.json({ _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Contact submission error:", error)
    return NextResponse.json({ error: "Failed to submit contact" }, { status: 500 })
  }
}

// GET all contacts (admin only)
export async function GET(request: NextRequest) {
  try {
    const contacts = await getCollection<Contact>("contacts")
    const result = await contacts.find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Fetch contacts error:", error)
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}
