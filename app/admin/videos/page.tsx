"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Trash2, Edit2, Plus } from "lucide-react"
import type { Video } from "@/lib/db-models"
import AdminLayout from "@/components/AdminLayout"

export default function VideosAdmin() {
  const [videos, setVideos] = useState<Video[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    type: "youtube" as "youtube" | "upload",
  })

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch("/api/videos")
      const data = await response.json()
      setVideos(data)
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/videos/${editingId}` : "/api/videos"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ title: "", url: "", type: "youtube" })
        setShowForm(false)
        setEditingId(null)
        fetchVideos()
      }
    } catch (error) {
      console.error("Submit error:", error)
    }
  }

  const handleEdit = (video: Video) => {
    setFormData({
      title: video.title,
      url: video.url,
      type: video.type,
    })
    setEditingId(video._id?.toString() || null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      const response = await fetch(`/api/videos/${id}`, { method: "DELETE" })
      if (response.ok) {
        fetchVideos()
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-primary">🎥 Video Management</h2>
          <p className="text-muted-foreground mt-2">Manage your video content and media library</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ title: "", url: "", type: "youtube" })
            setShowForm(!showForm)
          }}
          className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
        >
          <Plus size={20} /> Add New Video
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-primary/20 rounded-xl shadow-lg p-8 mb-8 space-y-6">
          <h3 className="text-2xl font-bold text-primary mb-6">
            {editingId ? "✏️ Edit Video" : "➕ Add New Video"}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Video Title</label>
              <input
                type="text"
                placeholder="Enter video title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Video Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as "youtube" | "upload" })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="youtube">YouTube</option>
                <option value="upload">Upload</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-lg font-bold mb-3 text-primary">
              {formData.type === "youtube" ? "YouTube URL" : "Video URL"}
            </label>
            <input
              type="url"
              placeholder={formData.type === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://example.com/video.mp4"}
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              {editingId ? "💾 Update Video" : "✅ Create Video"}
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
          <h3 className="text-xl font-bold">📋 Video List ({videos.length} videos)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/10 border-b-2 border-primary/20">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Video Title</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Type</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">URL</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground text-lg">
                    📝 No videos added yet. Click "Add New Video" to get started.
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video._id?.toString()} className="border-b border-border hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          🎥
                        </div>
                        <div>
                          <div className="font-bold text-primary">{video.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full font-semibold ${
                        video.type === "youtube"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {video.type === "youtube" ? "YouTube" : "Upload"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {video.url.length > 50 ? `${video.url.slice(0, 50)}...` : video.url}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(video)}
                          className="bg-blue-100 text-blue-600 p-3 rounded-lg hover:bg-blue-200 transition-all duration-300 transform hover:scale-110"
                          title="Edit Video"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(video._id?.toString() || "")}
                          className="bg-red-100 text-red-600 p-3 rounded-lg hover:bg-red-200 transition-all duration-300 transform hover:scale-110"
                          title="Delete Video"
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