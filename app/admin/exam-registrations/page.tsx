"use client"

import { useState, useEffect } from "react"
import { Download } from "lucide-react"
import type { ExamRegistration } from "@/lib/db-models"
import AdminLayout from "@/components/AdminLayout"

export default function ExamRegistrationsAdmin() {
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([])
  const [selectedRegistration, setSelectedRegistration] = useState<ExamRegistration | null>(null)
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all")

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
          <option value="pending">Pending</option>
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
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg) => (
                  <tr
                    key={reg._id?.toString()}
                    onClick={() => setSelectedRegistration(reg)}
                    className={`border-b border-border hover:bg-primary/5 cursor-pointer ${
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
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {reg.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedRegistration && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
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
                      : "text-red-600"
                }`}
              >
                {selectedRegistration.paymentStatus}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
