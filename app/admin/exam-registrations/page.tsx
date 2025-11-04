"use client"

import { useState, useEffect, useMemo } from "react"
import { Download, Edit2, Trash2, CheckCircle, XCircle, Search, SortAsc, SortDesc } from "lucide-react"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "email" | "paymentStatus" | "createdAt">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

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

  // Filtered and sorted registrations
  const filteredAndSortedRegistrations = useMemo(() => {
    let filtered = registrations.filter(registration =>
      registration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.mobile.includes(searchTerm) ||
      registration.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Apply payment status filter
    if (filterPaymentStatus !== "all") {
      filtered = filtered.filter((r) => r.paymentStatus === filterPaymentStatus)
    }

    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "email":
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case "paymentStatus":
          aValue = a.paymentStatus
          bValue = b.paymentStatus
          break
        case "createdAt":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [registrations, searchTerm, filterPaymentStatus, sortBy, sortOrder])

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const exportToCSV = () => {
    const csv = [
      ["Name", "Email", "Mobile", "Registration Number", "Payment Status", "Date"].join(","),
      ...filteredAndSortedRegistrations.map((r) =>
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
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Exam Registrations</h2>
            <p className="text-gray-600 mt-2">Manage exam registration records</p>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
          {/* Search and Sort Controls */}
          <div className="space-y-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search registrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Payment Status:</label>
                <select
                  value={filterPaymentStatus}
                  onChange={(e) => setFilterPaymentStatus(e.target.value)}
                  className="border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  title="Filter by payment status"
                >
                  <option value="all">All Registrations</option>
                  <option value="pending">Pending (Gateway)</option>
                  <option value="pending_cash">Pending (Cash)</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleSort("name")}
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg transition-all ${
                    sortBy === "name" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Name {sortBy === "name" && (sortOrder === "asc" ? <SortAsc size={12} /> : <SortDesc size={12} />)}
                </button>
                <button
                  onClick={() => toggleSort("createdAt")}
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg transition-all ${
                    sortBy === "createdAt" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Date {sortBy === "createdAt" && (sortOrder === "asc" ? <SortAsc size={12} /> : <SortDesc size={12} />)}
                </button>
                <button
                  onClick={() => toggleSort("paymentStatus")}
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg transition-all ${
                    sortBy === "paymentStatus" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Status {sortBy === "paymentStatus" && (sortOrder === "asc" ? <SortAsc size={12} /> : <SortDesc size={12} />)}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 max-h-96 overflow-y-auto scrollbar-custom">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm">Name</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm">Email</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm">Mobile</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm">Status</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm">Date</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedRegistrations.map((reg) => (
                  <tr
                    key={reg._id?.toString()}
                    className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 ${
                      selectedRegistration?._id === reg._id ? "bg-gradient-to-r from-primary/10 to-secondary/10 shadow-md" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{reg.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{reg.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{reg.mobile}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          reg.paymentStatus === "completed"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : reg.paymentStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : reg.paymentStatus === "pending_cash"
                                ? "bg-orange-100 text-orange-800 border border-orange-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {reg.paymentStatus.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(reg.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedRegistration(reg)
                            setIsEditing(false)
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all duration-300 hover:shadow-md"
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(reg)
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all duration-300 hover:shadow-md"
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
                            className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-all duration-300 hover:shadow-md"
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
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all duration-300 hover:shadow-md"
                          title="Delete Registration"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedRegistration && (
        <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Registration Details</h3>
              <p className="text-gray-600 mt-1">Registration #{selectedRegistration.registrationNumber}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(selectedRegistration)}
                className="p-3 hover:bg-blue-50 text-blue-600 rounded-lg transition-all duration-300 hover:shadow-md"
                title="Edit Registration"
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={() => handleDelete(selectedRegistration._id?.toString() || "")}
                className="p-3 hover:bg-red-50 text-red-600 rounded-lg transition-all duration-300 hover:shadow-md"
                title="Delete Registration"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700">Registration Number</label>
                  <p className="font-bold text-xl text-primary bg-primary/10 px-4 py-3 rounded-lg border border-primary/20">{selectedRegistration.registrationNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700">Mobile</label>
                  <input
                    type="text"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700">Date of Birth</label>
                  <input
                    type="text"
                    value={editForm.dob}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700">Center</label>
                  <input
                    type="text"
                    value={editForm.center}
                    onChange={(e) => setEditForm({ ...editForm, center: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700">Language</label>
                  <input
                    type="text"
                    value={editForm.language}
                    onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700">Payment Status</label>
                  <select
                    value={editForm.paymentStatus}
                    onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value as "pending" | "completed" | "failed" | "pending_cash" })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="pending">Pending (Gateway)</option>
                    <option value="pending_cash">Pending (Cash)</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Update Registration
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                  <p className="text-sm font-bold text-blue-700 mb-2">Registration Number</p>
                  <p className="font-bold text-2xl text-blue-900">{selectedRegistration.registrationNumber}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                  <p className="text-sm font-bold text-green-700 mb-2">Name</p>
                  <p className="font-bold text-xl text-green-900">{selectedRegistration.name}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                  <p className="text-sm font-bold text-purple-700 mb-2">Email</p>
                  <p className="font-bold text-lg text-purple-900">{selectedRegistration.email}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                  <p className="text-sm font-bold text-orange-700 mb-2">Mobile</p>
                  <p className="font-bold text-xl text-orange-900">{selectedRegistration.mobile}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
                  <p className="text-sm font-bold text-indigo-700 mb-2">Date of Birth</p>
                  <p className="font-bold text-xl text-indigo-900">{selectedRegistration.dob}</p>
                </div>
                <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200">
                  <p className="text-sm font-bold text-pink-700 mb-2">Center</p>
                  <p className="font-bold text-xl text-pink-900">{selectedRegistration.center}</p>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-6 rounded-xl border border-teal-200">
                  <p className="text-sm font-bold text-teal-700 mb-2">Language</p>
                  <p className="font-bold text-xl text-teal-900">{selectedRegistration.language}</p>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                  <p className="text-sm font-bold text-gray-700 mb-2">Payment Status</p>
                  <p
                    className={`font-bold text-xl capitalize ${
                      selectedRegistration.paymentStatus === "completed"
                        ? "text-green-600"
                        : selectedRegistration.paymentStatus === "pending"
                          ? "text-yellow-600"
                          : selectedRegistration.paymentStatus === "pending_cash"
                            ? "text-orange-600"
                            : "text-red-600"
                    }`}
                  >
                    {selectedRegistration.paymentStatus.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
