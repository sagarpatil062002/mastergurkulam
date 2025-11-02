"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import type { Exam } from "@/lib/db-models"

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"register" | "results" | "grievance">("register")

  useEffect(() => {
    fetch("/api/exams")
      .then((res) => res.json())
      .then((data) => {
        setExams(data)
        if (data.length > 0) setSelectedExam(data[0])
      })
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-secondary text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">MTS Exam Portal</h1>
          <p className="text-xl opacity-90 mb-8">Register for exams, check results, and manage grievances</p>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap gap-4 md:gap-8">
            <button
              onClick={() => setActiveTab("register")}
              className={`py-4 px-4 font-semibold border-b-2 transition ${
                activeTab === "register"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              📝 Register for Exam
            </button>
            <button
              onClick={() => setActiveTab("results")}
              className={`py-4 px-4 font-semibold border-b-2 transition ${
                activeTab === "results"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              📊 Check Results
            </button>
            <button
              onClick={() => setActiveTab("grievance")}
              className={`py-4 px-4 font-semibold border-b-2 transition ${
                activeTab === "grievance"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              ⚠️ File Grievance
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background flex-1">
        <div className="max-w-6xl mx-auto px-4">
          {activeTab === "register" && <ExamRegistration exams={exams} />}
          {activeTab === "results" && <CheckResults />}
          {activeTab === "grievance" && <FileGrievance />}
        </div>
      </section>

      <Footer />
    </div>
  )
}

function ExamRegistration({ exams }: { exams: Exam[] }) {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(exams[0] || null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    center: "",
    language: "",
    idProof: null as File | null,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExam) return

    setLoading(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append("exam_id", selectedExam._id?.toString() || "")
      formDataObj.append("name", formData.name)
      formDataObj.append("email", formData.email)
      formDataObj.append("mobile", formData.mobile)
      formDataObj.append("dob", formData.dob)
      formDataObj.append("center", formData.center)
      formDataObj.append("language", formData.language)
      if (formData.idProof) {
        formDataObj.append("idProof", formData.idProof)
      }

      const response = await fetch("/api/exam-registrations", {
        method: "POST",
        body: formDataObj,
      })

      if (response.ok) {
        const result = await response.json()
        // Redirect to success page with registration number
        window.location.href = `/exams/registration-success?reg=${result.registrationNumber}`
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  if (exams.length === 0) {
    return <div className="text-center text-muted-foreground">No exams available</div>
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Exam List */}
      <div className="lg:col-span-1">
        <h3 className="font-bold text-2xl mb-6 text-primary">Available Exams</h3>
        <div className="space-y-4">
          {exams
            .filter((e) => e.registrationOpen)
            .map((exam) => (
              <button
                key={exam._id?.toString()}
                onClick={() => setSelectedExam(exam)}
                className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedExam?._id === exam._id
                    ? "border-primary bg-primary/10 shadow-lg"
                    : "border-border hover:border-primary hover:shadow-md"
                }`}
              >
                <h4 className="font-bold text-lg mb-2">{exam.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{exam.description.slice(0, 100)}...</p>
                <p className="text-lg font-semibold text-primary">Fee: ₹{exam.examFee}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Exam Date: {new Date(exam.examDate).toLocaleDateString()}
                </p>
              </button>
            ))}
        </div>
      </div>

      {/* Registration Form */}
      <div className="lg:col-span-2">
        {selectedExam && (
          <div className="bg-white border border-border rounded-xl shadow-lg p-8">
            <h3 className="text-3xl font-bold mb-4 text-primary">{selectedExam.title}</h3>
            <p className="text-muted-foreground mb-8 text-lg">{selectedExam.description}</p>

            <div className="grid md:grid-cols-2 gap-6 mb-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
              <div>
                <h4 className="font-semibold text-primary mb-2">Exam Details</h4>
                <p className="text-sm"><strong>Date:</strong> {new Date(selectedExam.examDate).toLocaleDateString()}</p>
                <p className="text-sm"><strong>Fee:</strong> ₹{selectedExam.examFee}</p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Registration Period</h4>
                <p className="text-sm"><strong>Start:</strong> {new Date(selectedExam.registrationStartDate).toLocaleDateString()}</p>
                <p className="text-sm"><strong>End:</strong> {new Date(selectedExam.registrationEndDate).toLocaleDateString()}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-3 text-primary">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-2 border-border rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-3 text-primary">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border-2 border-border rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-3 text-primary">Mobile</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full border-2 border-border rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-3 text-primary">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full border-2 border-border rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-3 text-primary">Exam Center</label>
                  <select
                    value={formData.center}
                    onChange={(e) => setFormData({ ...formData, center: e.target.value })}
                    className="w-full border-2 border-border rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  >
                    <option value="">Select Center</option>
                    {selectedExam.centers.map((center) => (
                      <option key={center} value={center}>
                        {center}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-3 text-primary">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full border-2 border-border rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  >
                    <option value="">Select Language</option>
                    {selectedExam.languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-primary">ID Proof (PDF/JPG)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFormData({ ...formData, idProof: e.target.files?.[0] || null })}
                  className="w-full border-2 border-border rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                {loading ? "🔄 Registering..." : `💳 Register & Pay ₹${selectedExam.examFee}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

function CheckResults() {
  const [searchType, setSearchType] = useState<"rollnumber" | "email">("rollnumber")
  const [searchValue, setSearchValue] = useState("")
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`/api/exam-results?type=${searchType}&value=${searchValue}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      } else {
        alert("Results not found")
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 text-center text-primary">Check Your Results</h2>
      <form onSubmit={handleSearch} className="bg-white border border-border rounded-xl shadow-lg p-10 mb-12">
        <div className="mb-8">
          <label className="block text-lg font-bold mb-4 text-primary">Search By</label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as "rollnumber" | "email")}
            className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="rollnumber">📝 Roll Number</option>
            <option value="email">📧 Email Address</option>
          </select>
        </div>
        <div className="mb-10">
          <input
            type="text"
            placeholder={searchType === "rollnumber" ? "Enter your roll number" : "Enter your email address"}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
        >
          {loading ? "🔍 Searching..." : "🔍 Search Results"}
        </button>
      </form>

      {results && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-10 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-2xl text-green-800 font-bold">Results Found!</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-inner">
            <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(results, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

function FileGrievance() {
  const [formData, setFormData] = useState({
    registrationNumber: "",
    email: "",
    description: "",
    proofFile: null as File | null,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append("registrationNumber", formData.registrationNumber)
      formDataObj.append("email", formData.email)
      formDataObj.append("description", formData.description)
      if (formData.proofFile) {
        formDataObj.append("proof", formData.proofFile)
      }

      const response = await fetch("/api/grievances", {
        method: "POST",
        body: formDataObj,
      })

      if (response.ok) {
        alert("Grievance submitted successfully")
        setFormData({
          registrationNumber: "",
          email: "",
          description: "",
          proofFile: null,
        })
      }
    } catch (error) {
      console.error("Grievance error:", error)
      alert("Failed to submit grievance")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 text-center text-primary">File a Grievance</h2>
      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl shadow-lg p-10 space-y-8">
        <div>
          <label className="block text-lg font-bold mb-4 text-primary">Registration Number</label>
          <input
            type="text"
            value={formData.registrationNumber}
            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
            className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Enter your registration number"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-bold mb-4 text-primary">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Enter your email address"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-bold mb-4 text-primary">Grievance Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={8}
            className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            placeholder="Please describe your grievance in detail..."
            required
          />
        </div>
        <div>
          <label className="block text-lg font-bold mb-4 text-primary">Supporting Document (Optional)</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFormData({ ...formData, proofFile: e.target.files?.[0] || null })}
            className="w-full border-2 border-border rounded-xl px-6 py-4 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          />
          <p className="text-sm text-muted-foreground mt-2">Upload any supporting documents (PDF, JPG, PNG)</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
        >
          {loading ? "📤 Submitting..." : "📤 Submit Grievance"}
        </button>
      </form>
    </div>
  )
}
