import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { Testimonial } from "@/lib/db-models"

export async function GET(request: NextRequest) {
  try {
    const testimonials = await getCollection<Testimonial>("testimonials")
    const result = await testimonials.find({ active: true }).sort({ order: 1 }).toArray()

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Fetch testimonials error:", error)
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const testimonials = await getCollection<Testimonial>("testimonials")

    const result = await testimonials.insertOne({
      ...data,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ _id: result.insertedId, ...data }, { status: 201 })
  } catch (error) {
    console.error("Create testimonial error:", error)
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 })
  }
}
