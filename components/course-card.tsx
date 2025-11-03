"use client"

import { ArrowRight } from "lucide-react"
import type { Course } from "@/lib/db-models"

interface CourseCardProps {
  course: Course
  onApply: (course: Course) => void
}

export default function CourseCard({ course, onApply }: CourseCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 group h-[28rem] flex flex-col">
      <div className="h-56 bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm text-muted relative overflow-hidden flex-shrink-0">
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
      <div className="p-6 flex-1 flex flex-col min-h-0">
        <h3 className="text-xl font-bold mb-2 text-primary flex-shrink-0">{course.title}</h3>
        <p className="text-gray-600 mb-2 font-medium text-sm flex-shrink-0">Duration: {course.duration}</p>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm text-gray-500 leading-relaxed overflow-y-auto scrollbar-custom max-h-32">
            {course.description}
          </p>
        </div>
        <button
          onClick={() => onApply(course)}
          className="w-full bg-linear-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 mt-4 flex-shrink-0"
        >
          Apply Now <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
