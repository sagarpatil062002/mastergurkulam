"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CourseCard from "@/components/course-card"
import TestimonialCard from "@/components/testimonial-card"
import type { Course, Facility, Testimonial } from "@/lib/db-models"

// Video Model for hero section
interface Video {
  _id?: string
  title: string
  url: string
  type: "youtube" | "upload"
  active: boolean
}

interface EnquiryFormData {
  name: string
  email: string
  mobile: string
  selectedCourse: string
}

// Helper function to extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string {
  // Handle youtu.be format: https://youtu.be/JosejdzqoRk?si=Lq9j-FFXQMX12xxO
  const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (youtuBeMatch) {
    return youtuBeMatch[1]
  }

  // Handle youtube.com format: https://www.youtube.com/watch?v=JosejdzqoRk
  const youtubeMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (youtubeMatch) {
    return youtubeMatch[1]
  }

  // If no match found, return the original URL (fallback)
  return url
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [heroVideo, setHeroVideo] = useState<Video | null>(null)
  const [showEnquiryForm, setShowEnquiryForm] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState<EnquiryFormData>({
    name: "",
    email: "",
    mobile: "",
    selectedCourse: "",
  })

  useEffect(() => {
    // Fetch courses
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch(console.error)

    // Fetch facilities
    fetch("/api/facilities")
      .then((res) => res.json())
      .then((data) => setFacilities(data))
      .catch(console.error)

    // Fetch testimonials
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => setTestimonials(data))
      .catch(console.error)

    // Fetch hero video
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data) => {
        const activeVideo = data.find((video: Video) => video.active)
        setHeroVideo(activeVideo || null)
      })
      .catch(console.error)

    // Admin access keyboard shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'z') {
        e.preventDefault()
        window.location.href = '/admin?access=admin2024'
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleApplyCourse = (course: Course) => {
    setSelectedCourse(course)
    setFormData({ ...formData, selectedCourse: course.title })
    setShowEnquiryForm(true)
  }

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        alert("Thank you! We will contact you soon.")
        setShowEnquiryForm(false)
        setFormData({ name: "", email: "", mobile: "", selectedCourse: "" })
      }
    } catch (error) {
      console.error("Enquiry submission error:", error)
      alert("Failed to submit enquiry")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {heroVideo ? (
          <div className="absolute inset-0">
            {heroVideo.type === "youtube" ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(heroVideo.url)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeVideoId(heroVideo.url)}&controls=0&showinfo=0&modestbranding=1`}
                className="w-full h-full object-cover"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video
                src={heroVideo.url}
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-600 to-secondary" />
        )}

        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in">
            Welcome to Master's Gurukulam
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 animate-slide-up">
            Excellence in Education & Exam Preparation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setSelectedCourse(null)
                setFormData({ ...formData, selectedCourse: "" })
                setShowEnquiryForm(true)
              }}
              className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:opacity-90 transition transform hover:scale-105"
            >
              Enquire Now
            </button>
            <a
              href="#courses"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-primary transition"
            >
              View Courses
            </a>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-primary">Our Courses</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course._id?.toString()} course={course} onApply={handleApplyCourse} />
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      {facilities.length > 0 && (
        <section className="py-16 bg-card">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-primary">Our Facilities</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {facilities.slice(0, 4).map((facility) => (
                <div key={facility._id?.toString()} className="group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                    {facility.image ? (
                      <img
                        src={facility.image || "/placeholder.svg"}
                        alt={facility.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl">🏫</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Facility Image</p>
                      </div>
                    )}
                  </div>
                  <div className="p-6 bg-white">
                    <h4 className="font-bold text-lg mb-2 text-primary">{facility.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{facility.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-background to-card">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-primary">Student Testimonials</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((testimonial) => (
                <TestimonialCard key={testimonial._id?.toString()} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Links Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Quick Links</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <a
              href="/exams"
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-bold text-lg mb-2">Check MTS Result</h3>
              <p className="text-sm opacity-90">View your exam results online</p>
            </a>
            <a
              href="/contact"
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-4xl mb-4">📞</div>
              <h3 className="font-bold text-lg mb-2">Contact Us</h3>
              <p className="text-sm opacity-90">Get in touch with our team</p>
            </a>
            <a
              href="/exams"
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-4xl mb-4">📅</div>
              <h3 className="font-bold text-lg mb-2">Upcoming Exams</h3>
              <p className="text-sm opacity-90">Check exam schedules</p>
            </a>
            <a
              href="/success-stories"
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="font-bold text-lg mb-2">Success Stories</h3>
              <p className="text-sm opacity-90">Inspiring student journeys</p>
            </a>
          </div>
        </div>
      </section>

      {/* Enquiry Form Modal */}
      {showEnquiryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">
              {selectedCourse ? `Apply for ${selectedCourse.title}` : "Enquiry Form"}
            </h3>
            <form onSubmit={handleSubmitEnquiry} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-2"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-2"
                required
              />
              <input
                type="tel"
                placeholder="Your Mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-2"
                required
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowEnquiryForm(false)}
                  className="flex-1 bg-border text-foreground py-2 rounded-lg hover:bg-border/80"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
