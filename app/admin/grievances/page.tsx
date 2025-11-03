"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, Clock, Trash2 } from "lucide-react"
import type { Grievance } from "@/lib/db-models"
import AdminLayout from "@/components/AdminLayout"

export default function GrievancesAdmin() {
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null)
  const [replyText, setReplyText] = useState("")
  const [status, setStatus] = useState<"pending" | "under_review" | "resolved">("pending")

  useEffect(() => {
    fetchGrievances()
  }, [])

  const fetchGrievances = async () => {
    try {
      const response = await fetch("/api/grievances")
      const data = await response.json()
      setGrievances(data)
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const handleStatusUpdate = async (grievanceId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/grievances/${grievanceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchGrievances()
        window.location.reload() // Force page refresh after CRUD operation
      }
    } catch (error) {
      console.error("Update error:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-500" size={20} />
      case "under_review":
        return <AlertCircle className="text-blue-500" size={20} />
      case "resolved":
        return <CheckCircle className="text-green-500" size={20} />
      default:
        return null
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this grievance?")) return
    try {
      const response = await fetch(`/api/grievances/${id}`, { method: "DELETE" })
      if (response.ok) {
        await fetchGrievances()
        setSelectedGrievance(null)
        setReplyText("")
        window.location.reload() // Force page refresh after CRUD operation
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-3xl font-bold mb-6">Grievances</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {grievances.map((grievance) => (
            <button
              key={grievance._id?.toString()}
              onClick={() => setSelectedGrievance(grievance)}
              className={`w-full text-left p-4 rounded-lg border-2 transition flex items-start gap-3 ${
                selectedGrievance?._id === grievance._id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary"
              }`}
            >
              <div className="mt-1">{getStatusIcon(grievance.status)}</div>
              <div>
                <p className="font-semibold">Grievance #{grievance._id?.toString().slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground capitalize">{grievance.status}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(grievance.createdAt).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedGrievance && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">Grievance Details</h3>
            <button
              onClick={() => handleDelete(selectedGrievance._id?.toString() || "")}
              className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
              title="Delete Grievance"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <select
              value={selectedGrievance.status}
              onChange={(e) => {
                handleStatusUpdate(selectedGrievance._id?.toString() || "", e.target.value)
                setSelectedGrievance({ ...selectedGrievance, status: e.target.value as any })
              }}
              className="w-full border border-border rounded-lg px-4 py-2 mt-1"
            >
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="mt-2">{selectedGrievance.description}</p>
          </div>

          {selectedGrievance.adminReply && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Admin Reply</p>
              <p className="mt-2">{selectedGrievance.adminReply}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Reply</label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              className="w-full border border-border rounded-lg px-4 py-2"
              placeholder="Send reply to user..."
            />
          </div>

          <button
            onClick={async () => {
              if (replyText.trim()) {
                try {
                  const response = await fetch(`/api/grievances/${selectedGrievance._id?.toString()}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ adminReply: replyText }),
                  })
                  if (response.ok) {
                    setReplyText("")
                    await fetchGrievances()
                    window.location.reload() // Force page refresh after CRUD operation
                  }
                } catch (error) {
                  console.error("Reply error:", error)
                }
              }
            }}
            className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90"
          >
            Send Reply
          </button>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
