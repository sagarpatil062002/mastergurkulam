import { type NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: 'rzp_test_7ZhFXaT3z3ethj',
  key_secret: 'hCRBftuV7yvlLwvMVeXAW4Fk',
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "INR", examId, studentDetails } = await request.json()

    const options = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency,
      receipt: `exam_${examId}_${Date.now()}`.substring(0, 40), // Limit to 40 characters
      notes: {
        examId,
        studentName: studentDetails.name,
        studentEmail: studentDetails.email,
      },
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: 'rzp_test_7ZhFXaT3z3ethj', // Public key for frontend
    })
  } catch (error) {
    console.error("Payment order creation error:", error)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}