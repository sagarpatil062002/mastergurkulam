import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { EmailTemplate } from "@/lib/db-models"
import { ObjectId } from "mongodb"

// GET - Fetch single email template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const emailTemplates = await getCollection<EmailTemplate>("email_templates")
    const template = await emailTemplates.findOne({ _id: new ObjectId(params.id) })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error fetching email template:", error)
    return NextResponse.json({ error: "Failed to fetch email template" }, { status: 500 })
  }
}

// PUT - Update email template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, subject, body, type, variables } = await request.json()

    if (!name || !subject || !body || !type) {
      return NextResponse.json({ error: "Name, subject, body, and type are required" }, { status: 400 })
    }

    const emailTemplates = await getCollection<EmailTemplate>("email_templates")

    // Check if template exists
    const existingTemplate = await emailTemplates.findOne({ _id: new ObjectId(params.id) })
    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Check if name is already taken by another template
    if (name !== existingTemplate.name) {
      const nameExists = await emailTemplates.findOne({ name, _id: { $ne: new ObjectId(params.id) } })
      if (nameExists) {
        return NextResponse.json({ error: "Template name already taken" }, { status: 400 })
      }
    }

    const updateData: Partial<EmailTemplate> = {
      name,
      subject,
      body,
      type,
      variables: variables || [],
      updatedAt: new Date()
    }

    const result = await emailTemplates.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({
      _id: params.id,
      ...updateData,
      createdAt: existingTemplate.createdAt
    })
  } catch (error) {
    console.error("Error updating email template:", error)
    return NextResponse.json({ error: "Failed to update email template" }, { status: 500 })
  }
}

// DELETE - Delete email template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const emailTemplates = await getCollection<EmailTemplate>("email_templates")

    const result = await emailTemplates.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Template deleted successfully" })
  } catch (error) {
    console.error("Error deleting email template:", error)
    return NextResponse.json({ error: "Failed to delete email template" }, { status: 500 })
  }
}