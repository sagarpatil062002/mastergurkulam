import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email-service"

interface NewsletterSubscription {
  _id?: string
  email: string
  name?: string
  subscribedAt: Date
  active: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const newsletter = await getCollection<NewsletterSubscription>("newsletter")

    // Check if email already exists
    const existing = await newsletter.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: "Email already subscribed" }, { status: 400 })
    }

    const result = await newsletter.insertOne({
      email,
      name: name || "",
      subscribedAt: new Date(),
      active: true,
    })

    // Send welcome email
    try {
      await sendEmail(
        email,
        "Welcome to Master's Gurukulam Newsletter",
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to Master's Gurukulam!</h1>
          <p>Thank you for subscribing to our newsletter. You'll now receive updates about:</p>
          <ul>
            <li>Latest exam notifications</li>
            <li>Course updates and new offerings</li>
            <li>Success stories and achievements</li>
            <li>Educational tips and resources</li>
          </ul>
          <p>Stay connected with us for the latest in education and exam preparation.</p>
          <br>
          <p>Best regards,<br>Master's Gurukulam Team</p>
        </div>
        `
      )
    } catch (emailError) {
      console.error("Welcome email failed:", emailError)
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      message: "Successfully subscribed to newsletter",
      id: result.insertedId
    }, { status: 201 })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const newsletter = await getCollection<NewsletterSubscription>("newsletter")
    const subscriptions = await newsletter.find({ active: true }).sort({ subscribedAt: -1 }).toArray()
    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error("Fetch newsletter subscriptions error:", error)
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}