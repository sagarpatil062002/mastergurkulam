"use client"

import { useState, useEffect } from "react"
import { Download, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react"
import type { ExamRegistration } from "@/lib/db-models"
import AdminLayout from "@/components/AdminLayout"

export default function ExamRegistrationsAdmin() {
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([])
  const [selectedRegistration, setSelectedRegistration] = useState<ExamRegistration | null>(null)
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all")
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    center: "",
    language: "",
    paymentStatus: "pending" as "pending" | "completed" | "failed" | "pending_cash",
  })

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      const response = await fetch("/api/exam-registrations")
      const data = await response.json()
      setRegistrations(data)
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const filteredRegistrations =
    filterPaymentStatus === "all" ? registrations : registrations.filter((r) => r.paymentStatus === filterPaymentStatus)

  const exportToCSV = () => {
    const csv = [
      ["Name", "Email", "Mobile", "Registration Number", "Payment Status", "Date"].join(","),
      ...filteredRegistrations.map((r) =>
        [
          r.name,
          r.email,
          r.mobile,
          r.registrationNumber,
          r.paymentStatus,
          new Date(r.createdAt).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `registrations-${Date.now()}.csv`
    a.click()
  }

  const handleEdit = (registration: ExamRegistration) => {
    setEditForm({
      name: registration.name,
      email: registration.email,
      mobile: registration.mobile,
      dob: registration.dob,
      center: registration.center,
      language: registration.language,
      paymentStatus: registration.paymentStatus,
    })
    setSelectedRegistration(registration)
    setIsEditing(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRegistration) return

    try {
      const response = await fetch(`/api/exam-registrations/${selectedRegistration._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (response.ok) {
        await fetchRegistrations()
        setIsEditing(false)
        window.location.reload() // Force page refresh after CRUD operation
      }
    } catch (error) {
      console.error("Update error:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this registration?")) return
    try {
      const response = await fetch(`/api/exam-registrations/${id}`, { method: "DELETE" })
      if (response.ok) {
        await fetchRegistrations()
        setSelectedRegistration(null)
        setIsEditing(false)
        window.location.reload() // Force page refresh after CRUD operation
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({
      name: "",
      email: "",
      mobile: "",
      dob: "",
      center: "",
      language: "",
      paymentStatus: "pending",
    })
  }

  const handlePaymentStatusUpdate = async (registrationId: string, newStatus: "completed" | "failed") => {
    try {
      const response = await fetch(`/api/exam-registrations/${registrationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newStatus }),
      })
      if (response.ok) {
        await fetchRegistrations()
        alert(`Payment status updated to ${newStatus}`)
      } else {
        alert("Failed to update payment status")
      }
    } catch (error) {
      console.error("Update error:", error)
      alert("Failed to update payment status")
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Exam Registrations</h2>
        <button
          onClick={exportToCSV}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="mb-6">
        <select
          value={filterPaymentStatus}
          onChange={(e) => setFilterPaymentStatus(e.target.value)}
          className="border border-border rounded-lg px-4 py-2"
        >
          <option value="all">All Registrations</option>
          <option value="pending">Pending (Gateway)</option>
          <option value="pending_cash">Pending (Cash)</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary/10 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg) => (
                  <tr
                    key={reg._id?.toString()}
                    className={`border-b border-border hover:bg-primary/5 ${
                      selectedRegistration?._id === reg._id ? "bg-primary/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm">{reg.name}</td>
                    <td className="px-4 py-3 text-sm">{reg.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          reg.paymentStatus === "completed"
                            ? "bg-green-100 text-green-800"
                            : reg.paymentStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : reg.paymentStatus === "pending_cash"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {reg.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRegistration(reg)
                          setIsEditing(false)
                        }}
                        className="p-1 hover:bg-primary/20 rounded transition"
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(reg)
                        }}
                        className="p-1 hover:bg-blue-100 text-blue-600 rounded transition"
                        title="Edit Registration"
                      >
                        <Edit2 size={16} />
                      </button>
                      {(reg.paymentStatus === "pending" || reg.paymentStatus === "pending_cash") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePaymentStatusUpdate(reg._id?.toString() || "", "completed")
                          }}
                          className="p-1 hover:bg-green-100 text-green-600 rounded transition"
                          title="Mark as Paid"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(reg._id?.toString() || "")
                        }}
                        className="p-1 hover:bg-red-100 text-red-600 rounded transition"
                        title="Delete Registration"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedRegistration && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Registration Details</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(selectedRegistration)}
                  className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                  title="Edit Registration"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(selectedRegistration._id?.toString() || "")}
                  className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                  title="Delete Registration"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Registration Number</label>
                  <p className="font-bold text-lg">{selectedRegistration.registrationNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border border-border rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full border border-border rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Mobile</label>
                  <input
                    type="text"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="w-full border border-border rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Date of Birth</label>
                  <input
                    type="text"
                    value={editForm.dob}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                    className="w-full border border-border rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Center</label>
                  <input
                    type="text"
                    value={editForm.center}
                    onChange={(e) => setEditForm({ ...editForm, center: e.target.value })}
                    className="w-full border border-border rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Language</label>
                  <input
                    type="text"
                    value={editForm.language}
                    onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                    className="w-full border border-border rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Payment Status</label>
                  <select
                    value={editForm.paymentStatus}
                    onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value as "pending" | "completed" | "failed" })}
                    className="w-full border border-border rounded-lg px-4 py-2"
                  >
                    <option value="pending">Pending (Gateway)</option>
                    <option value="pending_cash">Pending (Cash)</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90"
                  >
                    Update Registration
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-border text-foreground py-2 rounded-lg hover:bg-border/80"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Registration Number</p>
                  <p className="font-bold text-lg">{selectedRegistration.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{selectedRegistration.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{selectedRegistration.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="font-semibold">{selectedRegistration.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">DOB</p>
                  <p className="font-semibold">{selectedRegistration.dob}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Center</p>
                  <p className="font-semibold">{selectedRegistration.center}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-semibold">{selectedRegistration.language}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <p
                    className={`font-semibold capitalize ${
                      selectedRegistration.paymentStatus === "completed"
                        ? "text-green-600"
                        : selectedRegistration.paymentStatus === "pending"
                          ? "text-yellow-600"
                          : selectedRegistration.paymentStatus === "pending_cash"
                            ? "text-orange-600"
                            : "text-red-600"
                    }`}
                  >
                    {selectedRegistration.paymentStatus}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
