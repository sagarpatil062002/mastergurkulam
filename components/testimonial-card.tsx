import { Star } from "lucide-react"
import type { Testimonial } from "@/lib/db-models"

export default function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        {testimonial.image && (
          <img
            src={testimonial.image || "/placeholder.svg"}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div>
          <h4 className="font-bold">{testimonial.name}</h4>
          <p className="text-sm text-muted-foreground">{testimonial.course}</p>
        </div>
      </div>
      <div className="flex gap-1 mb-3">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} size={16} className="fill-secondary text-secondary" />
        ))}
      </div>
      <p className="text-foreground/80">{testimonial.message}</p>
    </div>
  )
}
