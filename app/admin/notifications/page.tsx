"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import type { Notification } from "@/lib/db-models"
import AdminLayout from "@/components/AdminLayout"

export default function NotificationsAdmin() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "warning" | "success" | "error",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingNotification ? `/api/notifications/${editingNotification._id}` : "/api/notifications"
      const method = editingNotification ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchNotifications()
        setShowForm(false)
        setEditingNotification(null)
        setFormData({ title: "", message: "", type: "info", startDate: "", endDate: "" })
      }
    } catch (error) {
      console.error("Error saving notification:", error)
    }
  }

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification)
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      startDate: notification.startDate.toISOString().split('T')[0],
      endDate: notification.endDate.toISOString().split('T')[0],
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchNotifications()
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-600" size={20} />
      case "warning":
        return <AlertTriangle className="text-yellow-600" size={20} />
      case "error":
        return <AlertCircle className="text-red-600" size={20} />
      default:
        return <Info className="text-blue-600" size={20} />
    }
  }

  const getStatusColor = (notification: Notification) => {
    const now = new Date()
    const start = new Date(notification.startDate)
    const end = new Date(notification.endDate)

    if (!notification.active) return "bg-gray-100 text-gray-600"
    if (now < start) return "bg-blue-100 text-blue-600"
    if (now > end) return "bg-red-100 text-red-600"
    return "bg-green-100 text-green-600"
  }

  const getStatusText = (notification: Notification) => {
    const now = new Date()
    const start = new Date(notification.startDate)
    const end = new Date(notification.endDate)

    if (!notification.active) return "Inactive"
    if (now < start) return "Scheduled"
    if (now > end) return "Expired"
    return "Active"
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Notification Management</h2>
          <p className="text-gray-600 mt-2">Manage notification banners displayed on the website</p>
        </div>
        <button
          onClick={() => {
            setEditingNotification(null)
            setFormData({ title: "", message: "", type: "info", startDate: "", endDate: "" })
            setShowForm(true)
          }}
          className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus size={20} /> Add Notification
        </button>
      </div>

      {/* Notification Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-primary">
            {editingNotification ? "Edit Notification" : "Add New Notification"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Notification title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "info" | "warning" | "success" | "error" })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="info">ℹ️ Information</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="success">✅ Success</option>
                  <option value="error">❌ Error</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Notification message"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {editingNotification ? "Update Notification" : "Add Notification"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingNotification(null)
                  setFormData({ title: "", message: "", type: "info", startDate: "", endDate: "" })
                }}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-primary">All Notifications</h3>
          <p className="text-sm text-gray-600 mt-1">Manage notification banners</p>
        </div>
        <div className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-xl font-bold mb-2">No Notifications</h3>
              <p>Create your first notification to display important announcements.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification._id?.toString()} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(notification)}`}>
                          {getStatusText(notification)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Start: {new Date(notification.startDate).toLocaleDateString()}</span>
                        <span>End: {new Date(notification.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(notification)}
                      className="p-2 text-blue-500 hover:text-blue-700 transition-colors duration-200"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(notification._id?.toString() || "")}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Notification Preview */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-primary">Live Preview</h3>
          <p className="text-sm text-gray-600 mt-1">How notifications appear on the website</p>
        </div>
        <div className="p-6">
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📢</div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">Sample Notification Title</h4>
                <p className="text-sm opacity-90">This is how your notification will appear to website visitors. It includes important announcements, updates, or alerts.</p>
                <div className="flex items-center gap-4 mt-3 text-xs opacity-75">
                  <span>Active until: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  <button className="text-white underline hover:no-underline">Dismiss</button>
                </div>
              </div>
              <button className="text-white hover:text-gray-200 text-xl">×</button>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Notifications appear at the top of all pages when active. Users can dismiss them, but they will reappear on next visit if still active.
            </p>
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}