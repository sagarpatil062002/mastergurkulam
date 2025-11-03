"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Trash2, Edit2, Plus } from "lucide-react"
import type { Exam } from "@/lib/db-models"
import AdminLayout from "@/components/AdminLayout"

export default function ExamsAdmin() {
  const [exams, setExams] = useState<Exam[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    banner: "",
    examDate: "",
    examFee: 500,
    registrationOpen: true,
    showResults: false,
  })

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/exams")
      const data = await response.json()
      setExams(data)
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/exams/${editingId}` : "/api/exams"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          title: "",
          description: "",
          banner: "",
          examDate: "",
          examFee: 500,
          registrationOpen: true,
          showResults: false,
        })
        setShowForm(false)
        setEditingId(null)
        await fetchExams()
        window.location.reload() // Force page refresh after CRUD operation
      }
    } catch (error) {
      console.error("Submit error:", error)
    }
  }

  const handleEdit = (exam: Exam) => {
    setFormData({
      title: exam.title,
      description: exam.description,
      banner: exam.banner || "",
      examDate: new Date(exam.examDate).toISOString().split("T")[0],
      examFee: exam.examFee,
      registrationOpen: exam.registrationOpen,
      showResults: exam.showResults,
    })
    setEditingId(exam._id?.toString() || null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      const response = await fetch(`/api/exams/${id}`, { method: "DELETE" })
      if (response.ok) {
        await fetchExams()
        window.location.reload() // Force page refresh after CRUD operation
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Exams</h2>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({
              title: "",
              description: "",
              banner: "",
              examDate: "",
              examFee: 500,
              registrationOpen: true,
              showResults: false,
            })
            setShowForm(!showForm)
          }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90"
        >
          <Plus size={18} /> Add Exam
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 mb-8 space-y-4">
          <input
            type="text"
            placeholder="Exam Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border border-border rounded-lg px-4 py-2"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-border rounded-lg px-4 py-2"
            required
          />
          <input
            type="date"
            value={formData.examDate}
            onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
            className="w-full border border-border rounded-lg px-4 py-2"
            required
          />
          <input
            type="number"
            placeholder="Exam Fee"
            value={formData.examFee}
            onChange={(e) => setFormData({ ...formData, examFee: Number.parseInt(e.target.value) })}
            className="w-full border border-border rounded-lg px-4 py-2"
            required
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.registrationOpen}
                onChange={(e) => setFormData({ ...formData, registrationOpen: e.target.checked })}
              />
              <span>Registration Open</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.showResults}
                onChange={(e) => setFormData({ ...formData, showResults: e.target.checked })}
              />
              <span>Show Results</span>
            </label>
          </div>
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
              <th className="px-6 py-3 text-left font-semibold">Title</th>
              <th className="px-6 py-3 text-left font-semibold">Exam Date</th>
              <th className="px-6 py-3 text-left font-semibold">Fee</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id?.toString()} className="border-b border-border hover:bg-primary/5">
                <td className="px-6 py-4">{exam.title}</td>
                <td className="px-6 py-4">{new Date(exam.examDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">₹{exam.examFee}</td>
                <td className="px-6 py-4">
                  {exam.registrationOpen ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Open</span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Closed</span>
                  )}
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => handleEdit(exam)} className="p-2 hover:bg-primary/20 rounded-lg transition">
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(exam._id?.toString() || "")}
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
