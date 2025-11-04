import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { sendEmail, generateConfirmationEmail } from "@/lib/email-service"
import type { Contact } from "@/lib/db-models"
import { syncContactToCRM, createCRMDeal } from "@/lib/crm-integration"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const contacts = await getCollection<Contact>("contacts")

    // Generate registration number
    const registrationNumber = `ADM-${Date.now()}`

    const result = await contacts.insertOne({
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      message: `Course: ${data.selectedCourse}`,
      type: "admission",
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Send confirmation email
    await sendEmail(
      data.email,
      "Enquiry Received - Master's Gurukulam",
      generateConfirmationEmail({
        name: data.name,
        registrationNumber,
        course: data.selectedCourse,
        email: data.email,
      }),
    )

    // Send admin notification
    await sendEmail(
      process.env.ADMIN_EMAIL || "admin@mastersgurukulam.com",
      `New Admission Enquiry from ${data.name}`,
      `<p>New enquiry for course: ${data.selectedCourse}</p>
       <p>Name: ${data.name}</p>
       <p>Email: ${data.email}</p>
       <p>Mobile: ${data.mobile}</p>`,
    )

    // Sync to CRM if enabled
    try {
      await syncContactToCRM({
        email: data.email,
        name: data.name,
        mobile: data.mobile,
        source: 'enquiry',
        courseInterest: data.selectedCourse,
        status: 'new',
        notes: `Course enquiry: ${data.selectedCourse}`
      })
    } catch (crmError) {
      console.error('CRM sync error:', crmError)
      // Don't fail the enquiry if CRM sync fails
    }

    return NextResponse.json({ _id: result.insertedId, registrationNumber }, { status: 201 })
  } catch (error) {
    console.error("Enquiry submission error:", error)
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 })
  }
}
