"use client"

import { ArrowRight } from "lucide-react"
import type { Course } from "@/lib/db-models"

interface CourseCardProps {
  course: Course
  onApply: (course: Course) => void
}

export default function CourseCard({ course, onApply }: CourseCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition">
      <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm text-muted">
        {course.image ? (
          <img src={course.image || "/placeholder.svg"} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          "Course Image"
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{course.title}</h3>
        <p className="text-muted-foreground mb-2">Duration: {course.duration}</p>
        <p className="text-sm text-muted-foreground mb-6">{course.description}</p>
        <button
          onClick={() => onApply(course)}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          Apply Now <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
