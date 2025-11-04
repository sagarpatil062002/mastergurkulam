"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import type { FAQ, Exam } from "@/lib/db-models"

export default function FAQsAdmin() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    examId: "",
    order: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [faqsRes, examsRes] = await Promise.all([
        fetch("/api/faqs"),
        fetch("/api/exams")
      ])
      const faqsData = await faqsRes.json()
      const examsData = await examsRes.json()
      setFaqs(faqsData)
      setExams(examsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingFAQ ? `/api/faqs/${editingFAQ._id}` : "/api/faqs"
      const method = editingFAQ ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchData()
        setShowForm(false)
        setEditingFAQ(null)
        setFormData({ question: "", answer: "", examId: "", order: 0 })
      }
    } catch (error) {
      console.error("Error saving FAQ:", error)
    }
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      examId: faq.examId?.toString() || "",
      order: faq.order,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return

    try {
      const response = await fetch(`/api/faqs/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error)
    }
  }

  const moveFAQ = async (id: string, direction: "up" | "down") => {
    const currentFAQ = faqs.find(f => f._id?.toString() === id)
    if (!currentFAQ) return

    const currentOrder = currentFAQ.order
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1

    // Find FAQ with new order
    const swapFAQ = faqs.find(f => f.order === newOrder && f.examId?.toString() === currentFAQ.examId?.toString())
    if (!swapFAQ) return

    try {
      await Promise.all([
        fetch(`/api/faqs/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...currentFAQ, order: newOrder }),
        }),
        fetch(`/api/faqs/${swapFAQ._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...swapFAQ, order: currentOrder }),
        })
      ])

      await fetchData()
    } catch (error) {
      console.error("Error reordering FAQ:", error)
    }
  }

  const groupedFAQs = faqs.reduce((acc, faq) => {
    const examId = faq.examId?.toString() || "general"
    if (!acc[examId]) acc[examId] = []
    acc[examId].push(faq)
    return acc
  }, {} as Record<string, FAQ[]>)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">FAQ Management</h2>
          <p className="text-gray-600 mt-2">Manage frequently asked questions for exams</p>
        </div>
        <button
          onClick={() => {
            setEditingFAQ(null)
            setFormData({ question: "", answer: "", examId: "", order: 0 })
            setShowForm(true)
          }}
          className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus size={20} /> Add FAQ
        </button>
      </div>

      {/* FAQ Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-primary">
            {editingFAQ ? "Edit FAQ" : "Add New FAQ"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Exam</label>
                <select
                  value={formData.examId}
                  onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                <label className="block text-sm font-bold mb-3 text-gray-700">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">Question</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Enter the FAQ question"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">Answer</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={6}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Enter the FAQ answer"
                required
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {editingFAQ ? "Update FAQ" : "Add FAQ"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingFAQ(null)
                  setFormData({ question: "", answer: "", examId: "", order: 0 })
                }}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAQs List */}
      <div className="space-y-8">
        {Object.entries(groupedFAQs).map(([examId, examFAQs]) => {
          const exam = exams.find(e => e._id?.toString() === examId)
          return (
            <div key={examId} className="bg-white rounded-xl shadow-2xl border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-primary">
                  {exam ? exam.title : "General FAQs"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {examFAQs.length} FAQ{examFAQs.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {examFAQs
                  .sort((a, b) => a.order - b.order)
                  .map((faq) => (
                    <div key={faq._id?.toString()} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-2">{faq.question}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveFAQ(faq._id?.toString() || "", "up")}
                            className="p-2 text-gray-400 hover:text-primary transition-colors duration-200"
                            disabled={faq.order === 0}
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            onClick={() => moveFAQ(faq._id?.toString() || "", "down")}
                            className="p-2 text-gray-400 hover:text-primary transition-colors duration-200"
                          >
                            <ChevronDown size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(faq)}
                            className="p-2 text-blue-500 hover:text-blue-700 transition-colors duration-200"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(faq._id?.toString() || "")}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}