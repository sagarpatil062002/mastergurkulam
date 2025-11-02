"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Trash2, Edit2, Plus } from "lucide-react"
import type { Course } from "@/lib/db-models"
import AdminLayout from "@/components/AdminLayout"

export default function CoursesAdmin() {
  const [courses, setCourses] = useState<Course[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    description: "",
    image: "",
    order: 1,
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/courses/${editingId}` : "/api/courses"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ title: "", duration: "", description: "", image: "", order: 1 })
        setShowForm(false)
        setEditingId(null)
        fetchCourses()
      }
    } catch (error) {
      console.error("Submit error:", error)
    }
  }

  const handleEdit = (course: Course) => {
    setFormData({
      title: course.title,
      duration: course.duration,
      description: course.description,
      image: course.image || "",
      order: course.order,
    })
    setEditingId(course._id?.toString() || null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      const response = await fetch(`/api/courses/${id}`, { method: "DELETE" })
      if (response.ok) {
        fetchCourses()
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-primary">📚 Course Management</h2>
          <p className="text-muted-foreground mt-2">Manage your course offerings and curriculum</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ title: "", duration: "", description: "", image: "", order: 1 })
            setShowForm(!showForm)
          }}
          className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
        >
          <Plus size={20} /> Add New Course
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-primary/20 rounded-xl shadow-lg p-8 mb-8 space-y-6">
          <h3 className="text-2xl font-bold text-primary mb-6">
            {editingId ? "✏️ Edit Course" : "➕ Add New Course"}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Course Title</label>
              <input
                type="text"
                placeholder="Enter course title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Duration</label>
              <input
                type="text"
                placeholder="e.g., 3 months, 6 weeks"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-lg font-bold mb-3 text-primary">Course Description</label>
            <textarea
              placeholder="Describe the course content, objectives, and benefits..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              required
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
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
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              {editingId ? "💾 Update Course" : "✅ Create Course"}
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
          <h3 className="text-xl font-bold">📋 Course List ({courses.length} courses)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/10 border-b-2 border-primary/20">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Course Title</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Duration</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Order</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground text-lg">
                    📝 No courses added yet. Click "Add New Course" to get started.
                  </td>
                </tr>
              ) : (
                courses
                  .sort((a, b) => a.order - b.order)
                  .map((course) => (
                    <tr key={course._id?.toString()} className="border-b border-border hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            📚
                          </div>
                          <div>
                            <div className="font-bold text-primary">{course.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{course.description.slice(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full font-semibold">
                          ⏱️ {course.duration}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-bold">
                          #{course.order}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(course)}
                            className="bg-blue-100 text-blue-600 p-3 rounded-lg hover:bg-blue-200 transition-all duration-300 transform hover:scale-110"
                            title="Edit Course"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(course._id?.toString() || "")}
                            className="bg-red-100 text-red-600 p-3 rounded-lg hover:bg-red-200 transition-all duration-300 transform hover:scale-110"
                            title="Delete Course"
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
