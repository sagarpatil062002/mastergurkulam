"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Recaptcha from "@/components/recaptcha"
import type { Exam, FAQ } from "@/lib/db-models"
import { analytics } from "@/lib/analytics"

// Razorpay types
declare global {
  interface Window {
    Razorpay: any
  }
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"register" | "results" | "grievance" | "hallticket" | "faqs">("register")

  useEffect(() => {
    analytics.trackPageView('Exams Page', 'exams')

    fetch("/api/exams")
      .then((res) => res.json())
      .then((data) => {
        setExams(data)
        if (data.length > 0) setSelectedExam(data[0])
      })
      .catch(console.error)

    // Load Razorpay script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    if (selectedExam?._id) {
      fetch(`/api/faqs?examId=${selectedExam._id}`)
        .then((res) => res.json())
        .then((data) => setFaqs(data))
        .catch(console.error)
    }
  }, [selectedExam])

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
              onClick={() => setActiveTab("hallticket")}
              className={`py-4 px-4 font-semibold border-b-2 transition ${
                activeTab === "hallticket"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              🎫 Hall Ticket
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
            <button
              onClick={() => setActiveTab("faqs")}
              className={`py-4 px-4 font-semibold border-b-2 transition ${
                activeTab === "faqs"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              ❓ FAQs
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background flex-1">
        <div className="max-w-6xl mx-auto px-4">
          {activeTab === "register" && <ExamRegistration exams={exams} />}
          {activeTab === "results" && <CheckResults />}
          {activeTab === "hallticket" && <DownloadHallTicket />}
          {activeTab === "grievance" && <FileGrievance />}
          {activeTab === "faqs" && <ExamFAQs exams={exams} />}
        </div>
      </section>

      <Footer />
    </div>
  )
}

function ExamRegistration({ exams }: { exams: Exam[] }) {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(exams[0] || null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
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
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"gateway" | "cash">("gateway")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExam) return

    if (!recaptchaToken) {
      alert("Please complete the reCAPTCHA verification")
      return
    }

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
      formDataObj.append("examFee", selectedExam.examFee.toString())
      formDataObj.append("paymentMethod", paymentMethod)
      if (formData.idProof) {
        formDataObj.append("idProof", formData.idProof)
      }

      const response = await fetch("/api/exam-registrations", {
        method: "POST",
        body: formDataObj,
      })

      if (response.ok) {
        const result = await response.json()

        if (paymentMethod === "gateway") {
          // Create Razorpay order
          const orderResponse = await fetch("/api/payment/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: selectedExam.examFee,
              examId: selectedExam._id?.toString(),
              studentDetails: {
                name: formData.name,
                email: formData.email,
              },
            }),
          })

          if (orderResponse.ok) {
            const orderData = await orderResponse.json()

            // Initialize Razorpay
            const options = {
              key: orderData.key,
              amount: orderData.amount,
              currency: orderData.currency,
              order_id: orderData.orderId,
              name: "Master's Gurukulam",
              description: `${selectedExam.title} Registration`,
              handler: async function (response: any) {
                // Verify payment
                const verifyResponse = await fetch("/api/payment/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    registrationId: result._id.toString(),
                  }),
                })

                if (verifyResponse.ok) {
                  analytics.trackExamRegistration(response.razorpay_order_id, selectedExam.title, 'gateway')
                  // Redirect to success page
                  window.location.href = `/exams/registration-success?reg=${result.registrationNumber}&payment=success`
                } else {
                  analytics.trackError('payment_verification_failed', 'Payment verification failed for exam registration')
                  alert("Payment verification failed. Please contact support.")
                }
              },
              prefill: {
                name: formData.name,
                email: formData.email,
                contact: formData.mobile,
              },
              theme: {
                color: "#2563eb",
              },
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
          } else {
            alert("Failed to create payment order")
          }
        } else {
          // Cash payment - redirect to success page with pending payment
          window.location.href = `/exams/registration-success?reg=${result.registrationNumber}&payment=pending`
        }
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

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold mb-3 text-primary">Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("gateway")}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      paymentMethod === "gateway"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">💳</div>
                      <div className="font-semibold">Online Payment</div>
                      <div className="text-sm opacity-75">Pay securely online</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      paymentMethod === "cash"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">💵</div>
                      <div className="font-semibold">Cash at Center</div>
                      <div className="text-sm opacity-75">Pay at exam center</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* reCAPTCHA */}
              <div className="mb-6">
                <Recaptcha
                  onVerify={setRecaptchaToken}
                  onExpired={() => setRecaptchaToken(null)}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !recaptchaToken}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                {loading ? "🔄 Registering..." : paymentMethod === "gateway" ? `💳 Register & Pay ₹${selectedExam.examFee}` : `📝 Register (Pay at Center)`}
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
  const [results, setResults] = useState<any>(null)
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
        setResults(null)
        alert("Results not found. Please check your details and try again.")
      }
    } catch (error) {
      console.error("Search error:", error)
      setResults(null)
      alert("An error occurred while searching. Please try again.")
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
            <option value="rollnumber">📝 Registration Number</option>
            <option value="email">📧 Email Address</option>
          </select>
        </div>
        <div className="mb-10">
          <input
            type="text"
            placeholder={searchType === "rollnumber" ? "Enter your registration number (REG-XXXXXXXXX-XXXXXXXXX)" : "Enter your email address"}
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
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-2xl text-green-800 font-bold">Results Found!</p>
            <p className="text-lg text-green-700 mt-2">Congratulations on completing your exam</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-inner space-y-6">
            {/* Student Info */}
            <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-primary mb-4">Student Information</h3>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {results.studentName}</p>
                  <p><strong>Email:</strong> {results.email}</p>
                  <p><strong>Registration Number:</strong> {results.registrationNumber}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary mb-4">Exam Information</h3>
                <div className="space-y-2">
                  <p><strong>Exam:</strong> {results.exam?.title || "N/A"}</p>
                  <p><strong>Exam Date:</strong> {results.exam?.examDate ? new Date(results.exam.examDate).toLocaleDateString() : "N/A"}</p>
                  <p><strong>Published:</strong> {new Date(results.publishedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="text-center py-6">
              <h3 className="text-xl font-bold text-primary mb-6">Your Results</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{results.marks}</div>
                  <div className="text-sm text-blue-800">Marks Obtained</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{results.totalMarks}</div>
                  <div className="text-sm text-green-800">Total Marks</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{results.percentage.toFixed(2)}%</div>
                  <div className="text-sm text-purple-800">Percentage</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{results.grade}</div>
                  <div className="text-sm text-orange-800">Grade</div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="text-center py-4">
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold ${
                results.status === "pass"
                  ? "bg-green-100 text-green-800"
                  : results.status === "fail"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}>
                {results.status === "pass" ? "✅ PASSED" : results.status === "fail" ? "❌ FAILED" : "⚠️ ABSENT"}
              </div>
            </div>

            {/* Download Links */}
            {(results.resultFile || results.answerBookFile) && (
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-lg font-bold text-primary mb-4">Download Documents</h4>
                <div className="flex flex-wrap gap-4">
                  {results.resultFile && (
                    <a
                      href={results.resultFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      📄 Download Result
                    </a>
                  )}
                  {results.answerBookFile && (
                    <a
                      href={results.answerBookFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                      📚 Download Answer Book
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DownloadHallTicket() {
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Redirect to hall ticket page
      window.location.href = `/hall-ticket?reg=${registrationNumber}`
    } catch (error) {
      console.error("Hall ticket error:", error)
      alert("Failed to load hall ticket")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 text-center text-primary">Download Hall Ticket</h2>
      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl shadow-lg p-10 space-y-8">
        <div>
          <label className="block text-lg font-bold mb-4 text-primary">Registration Number</label>
          <input
            type="text"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Enter your registration number (REG-XXXXXXXXX-XXXXXXXXX)"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
        >
          {loading ? "🔍 Loading..." : "🎫 Download Hall Ticket"}
        </button>
        <p className="text-sm text-muted-foreground text-center">
          Hall tickets are available 7 days before the exam date
        </p>
      </form>
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

function ExamFAQs({ exams }: { exams: Exam[] }) {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(exams[0] || null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  useEffect(() => {
    if (selectedExam?._id) {
      fetch(`/api/faqs?examId=${selectedExam._id}`)
        .then((res) => res.json())
        .then((data) => setFaqs(data))
        .catch(console.error)
    }
  }, [selectedExam])

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 text-center text-primary">Frequently Asked Questions</h2>

      {/* Exam Selector */}
      <div className="mb-8">
        <label className="block text-lg font-bold mb-4 text-primary">Select Exam</label>
        <select
          value={selectedExam?._id?.toString() || ""}
          onChange={(e) => {
            const exam = exams.find(ex => ex._id?.toString() === e.target.value)
            setSelectedExam(exam || null)
          }}
          className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        >
          {exams.map((exam) => (
            <option key={exam._id?.toString()} value={exam._id?.toString()}>
              {exam.title}
            </option>
          ))}
        </select>
      </div>

      {/* FAQs List */}
      {faqs.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-2xl font-bold mb-2">No FAQs Available</h3>
          <p>FAQs for this exam will be available soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq._id?.toString()} className="bg-white border border-border rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === faq._id?.toString() ? null : faq._id?.toString() || null)}
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-primary pr-4">{faq.question}</h3>
                  <span className="text-2xl text-primary flex-shrink-0">
                    {expandedFAQ === faq._id?.toString() ? "−" : "+"}
                  </span>
                </div>
              </button>
              {expandedFAQ === faq._id?.toString() && (
                <div className="px-6 pb-6">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
