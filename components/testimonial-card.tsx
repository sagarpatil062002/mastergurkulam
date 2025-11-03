import { Star } from "lucide-react"
import type { Testimonial } from "@/lib/db-models"

export default function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
      <div className="flex items-center gap-4 mb-6">
        {testimonial.image ? (
          <img
            src={testimonial.image || "/placeholder.svg"}
            alt={testimonial.name}
            className="w-16 h-16 rounded-full object-cover shadow-xl"
            loading="lazy"
          />
        ) : (
          <div className="w-16 h-16 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-xl">
            <span className="text-white text-xl font-bold">{testimonial.name.charAt(0)}</span>
          </div>
        )}
        <div>
          <h4 className="font-bold text-xl text-primary">{testimonial.name}</h4>
          <p className="text-sm text-gray-600 font-medium">{testimonial.course}</p>
        </div>
      </div>
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-700 leading-relaxed text-lg italic">"{testimonial.message}"</p>
    </div>
  )
}
