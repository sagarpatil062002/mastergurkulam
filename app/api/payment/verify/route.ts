import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email-service"
import type { ExamRegistration } from "@/lib/db-models"
import { ObjectId } from "mongodb"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      registrationId
    } = await request.json()

    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSign = crypto
      .createHmac("sha256", 'hCRBftuV7yvlLwvMVeXAW4Fk')
      .update(sign.toString())
      .digest("hex")

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // Update registration payment status
    const registrations = await getCollection<ExamRegistration>("exam-registrations")

    const result = await registrations.updateOne(
      { _id: new ObjectId(registrationId) },
      {
        $set: {
          paymentStatus: "completed",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          paymentVerifiedAt: new Date(),
          updatedAt: new Date(),
        }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Get updated registration for email
    const registration = await registrations.findOne({ _id: new ObjectId(registrationId) })

    if (registration) {
      // Send payment confirmation email
      await sendEmail(
        registration.email,
        "Payment Successful - Exam Registration Confirmed",
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Payment Successful!</h2>
          <p>Dear ${registration.name},</p>
          <p>Your payment for the exam registration has been successfully processed.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Registration Details:</h3>
            <p><strong>Registration Number:</strong> ${registration.registrationNumber}</p>
            <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
            <p><strong>Amount Paid:</strong> ₹${registration.examFee}</p>
            <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Confirmed</span></p>
          </div>
          <p>Your hall ticket will be sent to this email address soon.</p>
          <p>Best regards,<br>Master's Gurukulam Team</p>
        </div>`
      )

      // Send notification to admin
      await sendEmail(
        process.env.ADMIN_EMAIL || "admin@mastersgurukulam.com",
        `Payment Received - ${registration.name}`,
        `<p>Payment received for exam registration:</p>
        <p><strong>Name:</strong> ${registration.name}</p>
        <p><strong>Email:</strong> ${registration.email}</p>
        <p><strong>Registration Number:</strong> ${registration.registrationNumber}</p>
        <p><strong>Amount:</strong> ₹${registration.examFee}</p>
        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>`
      )
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}