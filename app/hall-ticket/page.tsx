"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { analytics } from "@/lib/analytics"

function HallTicketContent() {
  const searchParams = useSearchParams()
  const registrationNumber = searchParams.get("reg")
  const [hallTicketData, setHallTicketData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (registrationNumber) {
      fetchHallTicket()
    }
  }, [registrationNumber])

  const fetchHallTicket = async () => {
    try {
      const response = await fetch(`/api/hall-ticket?registrationNumber=${registrationNumber}`)
      if (response.ok) {
        const data = await response.json()
        setHallTicketData(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error)
      }
    } catch (error) {
      console.error("Error fetching hall ticket:", error)
      setError("Failed to load hall ticket")
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    try {
      const element = document.getElementById("hall-ticket-card")
      if (!element) {
        alert("Hall ticket card not found. Please try again.")
        return
      }

      analytics.trackDownload('pdf', `hall-ticket-${registrationNumber}.pdf`)

      // Create a new window with the content
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (!printWindow) {
        alert("Please allow popups for this website to download PDF.")
        return
      }

      // Copy styles
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('')
          } catch (e) {
            return ''
          }
        })
        .join('')

      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Hall Ticket</title>
            <style>${styles}</style>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .print-only { display: block !important; }
            </style>
          </head>
          <body>
            ${element.outerHTML}
          </body>
        </html>
      `

      printWindow.document.write(content)
      printWindow.document.close()

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Use browser's print to PDF functionality
      printWindow.print()

      // Close window after a delay
      setTimeout(() => {
        printWindow.close()
      }, 1000)

    } catch (error) {
      console.error("Error generating PDF:", error)
      analytics.trackError('pdf_generation_failed', 'Failed to generate hall ticket PDF')
      alert("Error generating PDF. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading hall ticket...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-orange-600 mb-4">Hall Ticket Not Available</h1>
            <p className="text-lg text-muted-foreground mb-8">{error}</p>
            <a
              href="/exams"
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition"
            >
              Back to Exams
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!hallTicketData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Hall Ticket Not Found</h1>
            <p className="text-lg text-muted-foreground">The registration number provided is invalid.</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Success Section */}
      <section className="bg-gradient-to-br from-green-50 via-blue-50 to-primary/10 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-8xl mb-6">🎫</div>
          <h1 className="text-5xl font-bold text-green-800 mb-4">Hall Ticket Generated</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your hall ticket is ready. Please download and print it for the exam.
          </p>
          <div className="bg-white rounded-xl shadow-lg p-6 inline-block">
            <p className="text-lg font-semibold text-primary">Registration Number:</p>
            <p className="text-3xl font-bold text-green-600">{registrationNumber}</p>
          </div>
        </div>
      </section>

      {/* Hall Ticket Card */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <div id="hall-ticket-card" className="bg-white border-4 border-primary/20 rounded-xl shadow-lg p-8 mb-8">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-primary pb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎫</span>
              </div>
              <h2 className="text-4xl font-bold text-primary mb-2">HALL TICKET</h2>
              <p className="text-lg text-muted-foreground">Master's Gurukulam - MTS Exam Portal</p>
              <p className="text-sm text-muted-foreground mt-2">Valid for: {hallTicketData.exam?.title}</p>
            </div>

            {/* Student Photo Placeholder */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-40 bg-gray-100 border-2 border-primary/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-xs text-muted-foreground">Photo</p>
                  <p className="text-xs text-muted-foreground">3x4 cm</p>
                </div>
              </div>
            </div>

            {/* Student Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary mb-4">👤 Student Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Registration Number:</span>
                    <span className="text-primary font-bold">{hallTicketData.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Name:</span>
                    <span>{hallTicketData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Date of Birth:</span>
                    <span>{hallTicketData.dob}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Language:</span>
                    <span>{hallTicketData.language}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-secondary/5 to-primary/5 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary mb-4">📍 Exam Center Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Center:</span>
                    <span>{hallTicketData.center}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Exam Date:</span>
                    <span className="font-bold text-primary">{new Date(hallTicketData.exam?.examDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Reporting Time:</span>
                    <span>9:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Exam Time:</span>
                    <span>10:00 AM - 1:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Instructions */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-yellow-800 mb-4">⚠️ Important Instructions</h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• Report to the exam center 30 minutes before the exam time</li>
                <li>• Bring this hall ticket and valid ID proof (Aadhar/Passport/Driving License)</li>
                <li>• Electronic devices, calculators, and study materials are strictly prohibited</li>
                <li>• Follow all instructions given by the exam invigilators</li>
                <li>• No candidate will be allowed to enter after 10:00 AM</li>
                <li>• Keep this hall ticket safe until the exam is completed</li>
              </ul>
            </div>

            {/* Signature Section */}
            <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="border-b border-gray-400 w-full h-12 mb-2"></div>
                <p className="text-sm text-muted-foreground">Student Signature</p>
              </div>
              <div className="text-center">
                <div className="border-b border-gray-400 w-full h-12 mb-2"></div>
                <p className="text-sm text-muted-foreground">Invigilator Signature</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t pt-6 mt-6">
              <p className="text-sm text-muted-foreground">
                This is a computer-generated hall ticket. No signature required.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Generated on {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center">
            <button
              onClick={downloadPDF}
              className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              📄 Download Hall Ticket PDF
            </button>
            <p className="text-sm text-muted-foreground mt-4">
              Print this hall ticket and bring it to the exam center
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function HallTicketPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <HallTicketContent />
    </Suspense>
  )
}