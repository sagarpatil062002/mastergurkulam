"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Trash2, Edit2, Plus, Upload, Download } from "lucide-react"
import type { ExamResult, Exam } from "@/lib/db-models"
import AdminLayout from "@/components/AdminLayout"

export default function ExamResultsAdmin() {
  const [results, setResults] = useState<ExamResult[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    exam_id: "",
    registrationNumber: "",
    studentName: "",
    email: "",
    marks: 0,
    totalMarks: 100,
    percentage: 0,
    grade: "",
    status: "pass" as "pass" | "fail" | "absent",
    resultFile: "",
    answerBookFile: "",
  })

  useEffect(() => {
    fetchResults()
    fetchExams()
  }, [])

  const fetchResults = async () => {
    try {
      const response = await fetch("/api/exam-results")
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/exams")
      const data = await response.json()
      setExams(data)
    } catch (error) {
      console.error("Fetch exams error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/exam-results/${editingId}` : "/api/exam-results"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          exam_id: "",
          registrationNumber: "",
          studentName: "",
          email: "",
          marks: 0,
          totalMarks: 100,
          percentage: 0,
          grade: "",
          status: "pass",
          resultFile: "",
          answerBookFile: "",
        })
        setShowForm(false)
        setEditingId(null)
        await fetchResults()
        window.location.reload() // Force page refresh after CRUD operation
      }
    } catch (error) {
      console.error("Submit error:", error)
    }
  }

  const handleEdit = (result: ExamResult) => {
    setFormData({
      exam_id: result.exam_id.toString(),
      registrationNumber: result.registrationNumber,
      studentName: result.studentName,
      email: result.email,
      marks: result.marks,
      totalMarks: result.totalMarks,
      percentage: result.percentage,
      grade: result.grade,
      status: result.status,
      resultFile: result.resultFile || "",
      answerBookFile: result.answerBookFile || "",
    })
    setEditingId(result._id?.toString() || null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this result?")) return
    try {
      const response = await fetch(`/api/exam-results/${id}`, { method: "DELETE" })
      if (response.ok) {
        await fetchResults()
        window.location.reload() // Force page refresh after CRUD operation
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  const exportToCSV = () => {
    const csv = [
      ["Exam", "Registration Number", "Student Name", "Email", "Marks", "Total Marks", "Percentage", "Grade", "Status"].join(","),
      ...results.map((r) => {
        const exam = exams.find((e) => e._id?.toString() === r.exam_id.toString())
        return [
          exam?.title || "",
          r.registrationNumber,
          r.studentName,
          r.email,
          r.marks,
          r.totalMarks,
          r.percentage,
          r.grade,
          r.status,
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `exam-results-${Date.now()}.csv`
    a.click()
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-primary">📊 Exam Results Management</h2>
          <p className="text-muted-foreground mt-2">Upload and manage exam results for students</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90"
          >
            <Download size={18} /> Export CSV
          </button>
          <button
            onClick={() => {
              setEditingId(null)
              setFormData({
                exam_id: "",
                registrationNumber: "",
                studentName: "",
                email: "",
                marks: 0,
                totalMarks: 100,
                percentage: 0,
                grade: "",
                status: "pass",
                resultFile: "",
                answerBookFile: "",
              })
              setShowForm(!showForm)
            }}
            className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Plus size={20} /> Add Result
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-primary/20 rounded-xl shadow-lg p-8 mb-8 space-y-6">
          <h3 className="text-2xl font-bold text-primary mb-6">
            {editingId ? "✏️ Edit Result" : "➕ Add New Result"}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Select Exam</label>
              <select
                value={formData.exam_id}
                onChange={(e) => setFormData({ ...formData, exam_id: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              >
                <option value="">Select Exam</option>
                {exams.map((exam) => (
                  <option key={exam._id?.toString()} value={exam._id?.toString()}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Registration Number</label>
              <input
                type="text"
                placeholder="REG-XXXXXXXXX-XXXXXXXXX"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Student Name</label>
              <input
                type="text"
                placeholder="Enter student name"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Email</label>
              <input
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Marks</label>
              <input
                type="number"
                placeholder="85"
                value={formData.marks}
                onChange={(e) => {
                  const marks = parseInt(e.target.value) || 0
                  const percentage = formData.totalMarks > 0 ? (marks / formData.totalMarks) * 100 : 0
                  setFormData({
                    ...formData,
                    marks,
                    percentage: parseFloat(percentage.toFixed(2))
                  })
                }}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Total Marks</label>
              <input
                type="number"
                placeholder="100"
                value={formData.totalMarks}
                onChange={(e) => {
                  const totalMarks = parseInt(e.target.value) || 100
                  const percentage = totalMarks > 0 ? (formData.marks / totalMarks) * 100 : 0
                  setFormData({
                    ...formData,
                    totalMarks,
                    percentage: parseFloat(percentage.toFixed(2))
                  })
                }}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Percentage</label>
              <input
                type="number"
                step="0.01"
                value={formData.percentage}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                readOnly
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Grade</label>
              <input
                type="text"
                placeholder="A+"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "pass" | "fail" | "absent" })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Result File URL</label>
              <input
                type="url"
                placeholder="https://example.com/result.pdf"
                value={formData.resultFile}
                onChange={(e) => setFormData({ ...formData, resultFile: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-3 text-primary">Answer Book URL</label>
              <input
                type="url"
                placeholder="https://example.com/answer-book.pdf"
                value={formData.answerBookFile}
                onChange={(e) => setFormData({ ...formData, answerBookFile: e.target.value })}
                className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              {editingId ? "💾 Update Result" : "✅ Create Result"}
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
          <h3 className="text-xl font-bold">📋 Results List ({results.length} results)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/10 border-b-2 border-primary/20">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Student</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Exam</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Marks</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Grade</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Status</th>
                <th className="px-6 py-4 text-left font-bold text-primary text-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-lg">
                    📝 No results added yet. Click "Add Result" to get started.
                  </td>
                </tr>
              ) : (
                results.map((result) => {
                  const exam = exams.find((e) => e._id?.toString() === result.exam_id.toString())
                  return (
                    <tr key={result._id?.toString()} className="border-b border-border hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            👤
                          </div>
                          <div>
                            <div className="font-bold text-primary">{result.studentName}</div>
                            <div className="text-sm text-muted-foreground">{result.registrationNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full font-semibold">
                          📚 {exam?.title || "Unknown Exam"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <div className="font-bold text-primary">{result.marks}/{result.totalMarks}</div>
                          <div className="text-sm text-muted-foreground">{result.percentage.toFixed(2)}%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                          {result.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full font-semibold ${
                          result.status === "pass"
                            ? "bg-green-100 text-green-800"
                            : result.status === "fail"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {result.status === "pass" ? "✅ Pass" : result.status === "fail" ? "❌ Fail" : "⚠️ Absent"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(result)}
                            className="bg-blue-100 text-blue-600 p-3 rounded-lg hover:bg-blue-200 transition-all duration-300 transform hover:scale-110"
                            title="Edit Result"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(result._id?.toString() || "")}
                            className="bg-red-100 text-red-600 p-3 rounded-lg hover:bg-red-200 transition-all duration-300 transform hover:scale-110"
                            title="Delete Result"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}