"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import type { Testimonial } from "@/lib/db-models"

export default function SuccessStoriesPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => setTestimonials(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading success stories...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-secondary text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Success Stories</h1>
          <p className="text-xl opacity-90 mb-8">Inspiring journeys of our successful students</p>
        </div>
      </section>

      {/* Success Stories Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          {testimonials.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-2">No Success Stories Yet</h3>
              <p>Check back soon for inspiring student success stories!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial._id?.toString()}
                  className="bg-white border border-border rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Student Photo */}
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">
                        ⭐
                      </span>
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-center text-muted-foreground mb-6 italic">
                    "{testimonial.message}"
                  </blockquote>

                  {/* Student Info */}
                  <div className="text-center">
                    <h4 className="font-bold text-lg text-primary mb-1">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{testimonial.course}</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <span>⭐</span>
                      <span>{testimonial.rating}/5 Rating</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Your Success Story Starts Here</h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of successful students who achieved their dreams with Master's Gurukulam
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/courses"
              className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:opacity-90 transition transform hover:scale-105"
            >
              Explore Courses
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-primary transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}