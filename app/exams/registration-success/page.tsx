"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function RegistrationSuccess() {
  const searchParams = useSearchParams()
  const registrationNumber = searchParams.get("reg")
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (registrationNumber) {
      fetchRegistrationData()
    }
  }, [registrationNumber])

  const fetchRegistrationData = async () => {
    try {
      const response = await fetch(`/api/exam-registrations?registrationNumber=${registrationNumber}`)
      if (response.ok) {
        const data = await response.json()
        setRegistrationData(data)
      }
    } catch (error) {
      console.error("Error fetching registration data:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    const element = document.getElementById("registration-card")
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`registration-${registrationNumber}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
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
            <p className="text-lg text-muted-foreground">Loading registration details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!registrationData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Registration Not Found</h1>
            <p className="text-lg text-muted-foreground">The registration number provided is invalid or expired.</p>
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
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-5xl font-bold text-green-800 mb-4">Registration Successful!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your exam registration has been completed successfully. Please save this confirmation for your records.
          </p>
          <div className="bg-white rounded-xl shadow-lg p-6 inline-block">
            <p className="text-lg font-semibold text-primary">Registration Number:</p>
            <p className="text-3xl font-bold text-green-600">{registrationNumber}</p>
          </div>
        </div>
      </section>

      {/* Registration Card */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <div id="registration-card" className="bg-white border-2 border-primary/20 rounded-xl shadow-lg p-8 mb-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h2 className="text-3xl font-bold text-primary mb-2">Exam Registration Confirmation</h2>
              <p className="text-muted-foreground">Master's Gurukulam - MTS Exam Portal</p>
            </div>

            {/* Registration Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary mb-4">📋 Registration Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Registration Number:</span>
                    <span className="text-primary font-bold">{registrationData.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Registration Date:</span>
                    <span>{new Date(registrationData.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Payment Status:</span>
                    <span className={`font-bold ${registrationData.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {registrationData.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-secondary/5 to-primary/5 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary mb-4">👤 Personal Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Name:</span>
                    <span>{registrationData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Email:</span>
                    <span>{registrationData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Mobile:</span>
                    <span>{registrationData.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Date of Birth:</span>
                    <span>{registrationData.dob}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Exam Details */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-primary mb-4">📚 Exam Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-lg mb-2">Exam Details</h4>
                  <p className="text-sm"><strong>Exam:</strong> {registrationData.exam?.title}</p>
                  <p className="text-sm"><strong>Date:</strong> {registrationData.exam ? new Date(registrationData.exam.examDate).toLocaleDateString() : 'N/A'}</p>
                  <p className="text-sm"><strong>Fee:</strong> ₹{registrationData.exam?.examFee}</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Center & Language</h4>
                  <p className="text-sm"><strong>Center:</strong> {registrationData.center}</p>
                  <p className="text-sm"><strong>Language:</strong> {registrationData.language}</p>
                </div>
              </div>
            </div>

            {/* Important Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-yellow-800 mb-4">⚠️ Important Instructions</h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• Please arrive at the exam center 30 minutes before the scheduled time</li>
                <li>• Bring this confirmation slip and a valid ID proof</li>
                <li>• Electronic devices are not allowed in the exam hall</li>
                <li>• For any queries, contact us at support@mastersgurukulam.com</li>
                <li>• Keep this registration number safe for future reference</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="text-center border-t pt-6">
              <p className="text-sm text-muted-foreground">
                This is a computer-generated document. No signature required.
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
              📄 Download PDF Confirmation
            </button>
            <p className="text-sm text-muted-foreground mt-4">
              Save this PDF for your records and bring it to the exam center
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}