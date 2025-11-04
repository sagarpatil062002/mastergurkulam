import type { ObjectId } from "mongodb"

// Video Model
export interface Video {
  _id?: ObjectId
  title: string
  url: string
  type: "youtube" | "upload"
  createdAt: Date
  updatedAt: Date
}

// Course Model
export interface Course {
  _id?: ObjectId
  title: string
  slug: string
  duration: string
  description: string
  image: string
  order: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// Faculty Model
export interface Faculty {
  _id?: ObjectId
  name: string
  subject: string
  qualification: string
  bio: string
  image: string
  order: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// Facility Model
export interface Facility {
  _id?: ObjectId
  title: string
  description: string
  image: string
  order: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// Testimonial Model
export interface Testimonial {
  _id?: ObjectId
  name: string
  course: string
  message: string
  image: string
  rating: number
  order: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// Exam Model
export interface Exam {
  _id?: ObjectId
  title: string
  slug: string
  description: string
  banner: string
  registrationStartDate: Date
  registrationEndDate: Date
  examDate: Date
  examFee: number
  centers: string[]
  languages: string[]
  showResults: boolean
  registrationOpen: boolean
  active: boolean
  faqs?: FAQ[]
  createdAt: Date
  updatedAt: Date
}

// FAQ Model
export interface FAQ {
  _id?: ObjectId
  question: string
  answer: string
  examId?: ObjectId
  order: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// Exam Registration Model
export interface ExamRegistration {
  _id?: ObjectId
  exam_id: ObjectId
  name: string
  email: string
  mobile: string
  dob: string
  center: string
  language: string
  idProof?: string
  documents?: string[]
  paymentStatus: "pending" | "completed" | "failed" | "pending_cash"
  paymentMethod?: "gateway" | "cash"
  confirmationEmailSent: boolean
  registrationNumber: string
  examFee?: number // Add examFee field
  razorpayOrderId?: string
  razorpayPaymentId?: string
  paymentVerifiedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Grievance Model
export interface Grievance {
  _id?: ObjectId
  exam_id: ObjectId
  registration_id: ObjectId
  description: string
  proof?: string
  status: "pending" | "under_review" | "resolved"
  adminReply?: string
  createdAt: Date
  updatedAt: Date
}

// Activity Model
export interface Activity {
  _id?: ObjectId
  title: string
  description: string
  images: string[]
  category: string
  tags: string[]
  date: Date
  order: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// Contact Model
export interface Contact {
  _id?: ObjectId
  name: string
  email: string
  mobile: string
  message: string
  type: "general" | "admission" | "complaint" | "feedback" | "exam" | "other"
  status: "new" | "read" | "replied"
  createdAt: Date
  updatedAt: Date
}

// Admin User Model
export interface AdminUser {
  _id?: ObjectId
  name: string
  email: string
  password: string // Should be hashed
  role: "super_admin" | "staff" | "data_entry"
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// Exam Result Model
export interface ExamResult {
  _id?: ObjectId
  exam_id: ObjectId
  registrationNumber: string
  studentName: string
  email: string
  marks: number
  totalMarks: number
  percentage: number
  grade: string
  status: "pass" | "fail" | "absent"
  resultFile?: string // URL to result PDF/Excel
  answerBookFile?: string // URL to answer book PDF
  publishedAt: Date
  createdAt: Date
  updatedAt: Date
}

// Email Template Model
export interface EmailTemplate {
  _id?: ObjectId
  name: string
  subject: string
  body: string
  type: "registration" | "confirmation" | "admission" | "grievance" | "admit_card" | "result"
  variables: string[] // e.g., ['name', 'email', 'registrationNumber']
  createdAt: Date
  updatedAt: Date
}

// Notification Model
export interface Notification {
  _id?: ObjectId
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  active: boolean
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}
