import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { AdminUser } from "@/lib/db-models"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json()

    if (action === "login") {
      const admins = await getCollection<AdminUser>("admin_users")
      const admin = await admins.findOne({ email, active: true })

      if (!admin) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Verify password with bcrypt
      const isValidPassword = await bcrypt.compare(password, admin.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      return NextResponse.json({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
