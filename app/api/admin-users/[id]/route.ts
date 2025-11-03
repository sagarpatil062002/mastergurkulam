import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { AdminUser } from "@/lib/db-models"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

// GET - Fetch single admin user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUsers = await getCollection<AdminUser>("admin_users")
    const user = await adminUsers.findOne({ _id: new ObjectId(params.id) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove password from response
    const { password, ...sanitizedUser } = user

    return NextResponse.json(sanitizedUser)
  } catch (error) {
    console.error("Error fetching admin user:", error)
    return NextResponse.json({ error: "Failed to fetch admin user" }, { status: 500 })
  }
}

// PUT - Update admin user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, email, password, role, active } = await request.json()

    const adminUsers = await getCollection<AdminUser>("admin_users")

    // Check if user exists
    const existingUser = await adminUsers.findOne({ _id: new ObjectId(params.id) })
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailExists = await adminUsers.findOne({ email, _id: { $ne: new ObjectId(params.id) } })
      if (emailExists) {
        return NextResponse.json({ error: "Email already taken" }, { status: 400 })
      }
    }

    const updateData: Partial<AdminUser> = {
      name,
      email,
      role,
      active,
      updatedAt: new Date()
    }

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const result = await adminUsers.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      _id: params.id,
      name,
      email,
      role,
      active,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error("Error updating admin user:", error)
    return NextResponse.json({ error: "Failed to update admin user" }, { status: 500 })
  }
}

// DELETE - Delete admin user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUsers = await getCollection<AdminUser>("admin_users")

    // Check if user exists
    const user = await adminUsers.findOne({ _id: new ObjectId(params.id) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent deletion of super_admin users
    if (user.role === "super_admin") {
      return NextResponse.json({ error: "Cannot delete super admin user" }, { status: 400 })
    }

    const result = await adminUsers.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting admin user:", error)
    return NextResponse.json({ error: "Failed to delete admin user" }, { status: 500 })
  }
}