"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Trash2, Edit2, Plus } from "lucide-react"
import type { Activity } from "@/lib/db-models"
import AdminLayout from "@/components/AdminLayout"

export default function ActivitiesAdmin() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [] as string[],
    category: "",
    tags: [] as string[],
    date: "",
    order: 1,
  })

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activities")
      const data = await response.json()
      setActivities(data)
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/activities/${editingId}` : "/api/activities"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString(),
        }),
      })

      if (response.ok) {
        setFormData({
          title: "",
          description: "",
          images: [],
          category: "",
          tags: [],
          date: "",
          order: 1,
        })
        setShowForm(false)
        setEditingId(null)
        fetchActivities()
      }
    } catch (error) {
      console.error("Submit error:", error)
    }
  }

  const handleEdit = (activity: Activity) => {
    setFormData({
      title: activity.title,
      description: activity.description,
      images: activity.images || [],
      category: activity.category,
      tags: activity.tags || [],
      date: new Date(activity.date).toISOString().split("T")[0],
      order: activity.order,
    })
    setEditingId(activity._id?.toString() || null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      const response = await fetch(`/api/activities/${id}`, { method: "DELETE" })
      if (response.ok) {
        fetchActivities()
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-primary">📸 Activities Management</h2>
          <p className="text-muted-foreground mt-2">Manage your institute's activities and events</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({
              title: "",
              description: "",
              images: [],
              category: "",
              tags: [],
              date: "",
              order: 1,
            })
            setShowForm(!showForm)
          }}
          className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
        >
          <Plus size={20} /> Add New Activity
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-primary/20 rounded-xl shadow-lg p-8 mb-8 space-y-6">
          <h3 className="text-2xl font-bold text-primary mb-6">
            {editingId ? "✏️ Edit Activity" : "➕ Add New Activity"}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Activity Title</label>
              <input
                type="text"
                placeholder="Enter activity title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Category</label>
              <input
                type="text"
                placeholder="e.g., Workshop, Seminar, Cultural"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-lg font-bold mb-3 text-primary">Activity Description</label>
            <textarea
              placeholder="Describe the activity, its purpose, and highlights..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              required
            />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
              <label className="block text-lg font-bold mb-3 text-primary">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="tag1, tag2, tag3"
                value={formData.tags.join(", ")}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map(tag => tag.trim()) })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-lg font-bold mb-3 text-primary">Image URLs (one per line)</label>
            <textarea
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              value={formData.images.join("\n")}
              onChange={(e) => setFormData({ ...formData, images: e.target.value.split("\n").filter(url => url.trim()) })}
              rows={3}
              className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              {editingId ? "💾 Update Activity" : "✅ Create Activity"}
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
          <h3 className="text-xl font-bold">📋 Activities List ({activities.length} activities)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/10 border-b-2 border-primary/20">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Activity Title</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Category</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Date</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Order</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-lg">
                    📝 No activities added yet. Click "Add New Activity" to get started.
                  </td>
                </tr>
              ) : (
                activities
                  .sort((a, b) => a.order - b.order)
                  .map((activity) => (
                    <tr key={activity._id?.toString()} className="border-b border-border hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            📸
                          </div>
                          <div>
                            <div className="font-bold text-primary">{activity.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{activity.description.slice(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full font-semibold">
                          {activity.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                          📅 {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-bold">
                          #{activity.order}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(activity)}
                            className="bg-blue-100 text-blue-600 p-3 rounded-lg hover:bg-blue-200 transition-all duration-300 transform hover:scale-110"
                            title="Edit Activity"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(activity._id?.toString() || "")}
                            className="bg-red-100 text-red-600 p-3 rounded-lg hover:bg-red-200 transition-all duration-300 transform hover:scale-110"
                            title="Delete Activity"
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