"use client"

import { ArrowRight } from "lucide-react"
import type { Course } from "@/lib/db-models"

interface CourseCardProps {
  course: Course
  onApply: (course: Course) => void
}

export default function CourseCard({ course, onApply }: CourseCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 group">
      <div className="h-56 bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm text-muted relative overflow-hidden">
        {course.image ? (
          <img
            src={course.image || "/placeholder.svg"}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-sm font-medium">Course Image</p>
          </div>
        )}
      </div>
      <div className="p-8">
        <h3 className="text-2xl font-bold mb-3 text-primary">{course.title}</h3>
        <p className="text-gray-600 mb-3 font-medium">Duration: {course.duration}</p>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">{course.description}</p>
        <button
          onClick={() => onApply(course)}
          className="w-full bg-linear-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
        >
          Apply Now <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
