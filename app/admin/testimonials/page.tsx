"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Trash2, Edit2, Plus } from "lucide-react"
import type { Testimonial } from "@/lib/db-models"
import AdminLayout from "@/components/AdminLayout"

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    course: "",
    message: "",
    image: "",
    rating: 5,
    order: 1,
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials")
      const data = await response.json()
      setTestimonials(data)
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/testimonials/${editingId}` : "/api/testimonials"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ name: "", course: "", message: "", image: "", rating: 5, order: 1 })
        setShowForm(false)
        setEditingId(null)
        fetchTestimonials()
      }
    } catch (error) {
      console.error("Submit error:", error)
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      course: testimonial.course,
      message: testimonial.message,
      image: testimonial.image || "",
      rating: testimonial.rating,
      order: testimonial.order,
    })
    setEditingId(testimonial._id?.toString() || null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      const response = await fetch(`/api/testimonials/${id}`, { method: "DELETE" })
      if (response.ok) {
        fetchTestimonials()
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-primary">⭐ Testimonials Management</h2>
          <p className="text-muted-foreground mt-2">Manage student testimonials and reviews</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ name: "", course: "", message: "", image: "", rating: 5, order: 1 })
            setShowForm(!showForm)
          }}
          className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
        >
          <Plus size={20} /> Add New Testimonial
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-primary/20 rounded-xl shadow-lg p-8 mb-8 space-y-6">
          <h3 className="text-2xl font-bold text-primary mb-6">
            {editingId ? "✏️ Edit Testimonial" : "➕ Add New Testimonial"}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Student Name</label>
              <input
                type="text"
                placeholder="Enter student name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Course</label>
              <input
                type="text"
                placeholder="Course name"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-lg font-bold mb-3 text-primary">Testimonial Message</label>
            <textarea
              placeholder="Enter the testimonial message..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              required
            />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number.parseInt(e.target.value) || 5 })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Display Order</label>
              <input
                type="number"
                placeholder="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number.parseInt(e.target.value) || 1 })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                min="1"
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              {editingId ? "💾 Update Testimonial" : "✅ Create Testimonial"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transform hover:scale-105 transition-all duration-300"
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border-2 border-primary/20 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
          <h3 className="text-xl font-bold">📋 Testimonials List ({testimonials.length} testimonials)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/10 border-b-2 border-primary/20">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Student</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Course</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Rating</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Message</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Order</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-lg">
                    📝 No testimonials added yet. Click "Add New Testimonial" to get started.
                  </td>
                </tr>
              ) : (
                testimonials
                  .sort((a, b) => a.order - b.order)
                  .map((testimonial) => (
                    <tr key={testimonial._id?.toString()} className="border-b border-border hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            👤
                          </div>
                          <div>
                            <div className="font-bold text-primary">{testimonial.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full font-semibold">
                          📚 {testimonial.course}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < testimonial.rating ? "text-yellow-500" : "text-gray-300"}>
                              ⭐
                            </span>
                          ))}
                          <span className="ml-2 text-sm font-medium">({testimonial.rating})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-muted-foreground line-clamp-2 max-w-xs">{testimonial.message}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-bold">
                          #{testimonial.order}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(testimonial)}
                            className="bg-blue-100 text-blue-600 p-3 rounded-lg hover:bg-blue-200 transition-all duration-300 transform hover:scale-110"
                            title="Edit Testimonial"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(testimonial._id?.toString() || "")}
                            className="bg-red-100 text-red-600 p-3 rounded-lg hover:bg-red-200 transition-all duration-300 transform hover:scale-110"
                            title="Delete Testimonial"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}