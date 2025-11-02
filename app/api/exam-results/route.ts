import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { ExamRegistration } from "@/lib/db-models"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const searchType = searchParams.get("type")
    const searchValue = searchParams.get("value")

    const registrations = await getCollection<ExamRegistration>("exam_registrations")

    const query: any = { paymentStatus: "completed" }
    if (searchType === "rollnumber") {
      query.registrationNumber = searchValue
    } else if (searchType === "email") {
      query.email = searchValue
    }

    const result = await registrations.findOne(query)

    if (!result) {
      return NextResponse.json({ error: "Results not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
