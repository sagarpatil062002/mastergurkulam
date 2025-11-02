"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Trash2, Edit2, Plus } from "lucide-react"
import type { Faculty } from "@/lib/db-models"
import AdminLayout from "@/components/AdminLayout"

export default function FacultyAdmin() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    qualification: "",
    bio: "",
    image: "",
    order: 1,
  })

  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      const response = await fetch("/api/faculty")
      const data = await response.json()
      setFaculty(data)
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/faculty/${editingId}` : "/api/faculty"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ name: "", subject: "", qualification: "", bio: "", image: "", order: 1 })
        setShowForm(false)
        setEditingId(null)
        fetchFaculty()
      }
    } catch (error) {
      console.error("Submit error:", error)
    }
  }

  const handleEdit = (member: Faculty) => {
    setFormData({
      name: member.name,
      subject: member.subject,
      qualification: member.qualification,
      bio: member.bio,
      image: member.image || "",
      order: member.order,
    })
    setEditingId(member._id?.toString() || null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      const response = await fetch(`/api/faculty/${id}`, { method: "DELETE" })
      if (response.ok) {
        fetchFaculty()
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Faculty Members</h2>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ name: "", subject: "", qualification: "", bio: "", image: "", order: 1 })
            setShowForm(!showForm)
          }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90"
        >
          <Plus size={18} /> Add Faculty
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 mb-8 space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-border rounded-lg px-4 py-2"
            required
          />
          <input
            type="text"
            placeholder="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full border border-border rounded-lg px-4 py-2"
            required
          />
          <input
            type="text"
            placeholder="Qualification"
            value={formData.qualification}
            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            className="w-full border border-border rounded-lg px-4 py-2"
            required
          />
          <textarea
            placeholder="Bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full border border-border rounded-lg px-4 py-2"
            required
          />
          <input
            type="text"
            placeholder="Image URL"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full border border-border rounded-lg px-4 py-2"
          />
          <input
            type="number"
            placeholder="Order"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: Number.parseInt(e.target.value) })}
            className="w-full border border-border rounded-lg px-4 py-2"
          />
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90"
            >
              {editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-border text-foreground py-2 rounded-lg hover:bg-border/80"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary/10 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Subject</th>
              <th className="px-6 py-3 text-left font-semibold">Qualification</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map((member) => (
              <tr key={member._id?.toString()} className="border-b border-border hover:bg-primary/5">
                <td className="px-6 py-4">{member.name}</td>
                <td className="px-6 py-4">{member.subject}</td>
                <td className="px-6 py-4">{member.qualification}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => handleEdit(member)} className="p-2 hover:bg-primary/20 rounded-lg transition">
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id?.toString() || "")}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
