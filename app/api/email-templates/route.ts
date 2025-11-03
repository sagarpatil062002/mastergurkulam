import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { EmailTemplate } from "@/lib/db-models"

// GET - Fetch all email templates
export async function GET() {
  try {
    const emailTemplates = await getCollection<EmailTemplate>("email_templates")
    const templates = await emailTemplates.find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error fetching email templates:", error)
    return NextResponse.json({ error: "Failed to fetch email templates" }, { status: 500 })
  }
}

// POST - Create new email template
export async function POST(request: NextRequest) {
  try {
    const { name, subject, body, type, variables } = await request.json()

    if (!name || !subject || !body || !type) {
      return NextResponse.json({ error: "Name, subject, body, and type are required" }, { status: 400 })
    }

    const emailTemplates = await getCollection<EmailTemplate>("email_templates")

    // Check if template with same name exists
    const existingTemplate = await emailTemplates.findOne({ name })
    if (existingTemplate) {
      return NextResponse.json({ error: "Template with this name already exists" }, { status: 400 })
    }

    const newTemplate: EmailTemplate = {
      name,
      subject,
      body,
      type,
      variables: variables || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await emailTemplates.insertOne(newTemplate)

    return NextResponse.json({
      _id: result.insertedId,
      ...newTemplate
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating email template:", error)
    return NextResponse.json({ error: "Failed to create email template" }, { status: 500 })
  }
}