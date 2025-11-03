import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { AdminUser } from "@/lib/db-models"
import bcrypt from "bcryptjs"

// GET - Fetch all admin users
export async function GET() {
  try {
    const adminUsers = await getCollection<AdminUser>("admin_users")
    const users = await adminUsers.find({}).toArray()

    // Remove passwords from response
    const sanitizedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))

    return NextResponse.json(sanitizedUsers)
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json({ error: "Failed to fetch admin users" }, { status: 500 })
  }
}

// POST - Create new admin user
export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const adminUsers = await getCollection<AdminUser>("admin_users")

    // Check if user already exists
    const existingUser = await adminUsers.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser: AdminUser = {
      name,
      email,
      password: hashedPassword,
      role,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await adminUsers.insertOne(newUser)

    return NextResponse.json({
      _id: result.insertedId,
      name,
      email,
      role,
      active: true,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
  }
}