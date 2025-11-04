"use client"

import { useState, useEffect, Suspense } from "react"
import dynamic from "next/dynamic"
import type { Course, Facility, Testimonial } from "@/lib/db-models"
import { analytics } from "@/lib/analytics"

// Lazy load components
const Header = dynamic(() => import("@/components/header"))
const Footer = dynamic(() => import("@/components/footer"))
const CourseCard = dynamic(() => import("@/components/course-card"))
const TestimonialCard = dynamic(() => import("@/components/testimonial-card"))
const NotificationBar = dynamic(() => import("@/components/notification-bar"))

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
    // Track page view
    analytics.trackPageView('Home Page', 'landing')

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
      if (e.altKey && e.key === 'a') {
        e.preventDefault()
        analytics.trackInteraction('admin_access', 'navigation', 'keyboard_shortcut')
        window.location.href = '/admin?access=admin2024'
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleApplyCourse = (course: Course) => {
    analytics.trackInteraction('apply_course', 'courses', course.title)
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
        analytics.trackFormSubmit('course_enquiry', {
          course: formData.selectedCourse,
          enquiry_type: 'course_application'
        })
        alert("Thank you! We will contact you soon.")
        setShowEnquiryForm(false)
        setFormData({ name: "", email: "", mobile: "", selectedCourse: "" })
      }
    } catch (error) {
      console.error("Enquiry submission error:", error)
      analytics.trackError('enquiry_submission_failed', 'Failed to submit course enquiry')
      alert("Failed to submit enquiry")
    }
  }

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-0">
      <Suspense fallback={<div className="h-16 bg-white shadow-sm animate-pulse" />}>
        <NotificationBar />
      </Suspense>
      <Suspense fallback={<div className="h-16 bg-white shadow-sm animate-pulse" />}>
        <Header />
      </Suspense>

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
                loading="lazy"
              />
            ) : (
              <video
                src={heroVideo.url}
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
                preload="metadata"
              />
            )}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-linear-to-r from-primary via-blue-600 to-secondary" />
        )}

        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in drop-shadow-2xl">
            Welcome to Master's Gurukulam
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 animate-slide-up drop-shadow-lg">
            Excellence in Education & Exam Preparation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setSelectedCourse(null)
                setFormData({ ...formData, selectedCourse: "" })
                setShowEnquiryForm(true)
              }}
              className="bg-white text-primary px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
            >
              Enquire Now
            </button>
            <a
              href="#courses"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-primary transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              View Courses
            </a>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 text-primary drop-shadow-lg">Our Courses</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div key={course._id?.toString()} style={{ animationDelay: `${index * 100}ms` }} className="animate-fade-in-up">
                <Suspense fallback={<div className="h-96 bg-gray-200 rounded-xl animate-pulse shadow-lg" />}>
                  <CourseCard course={course} onApply={handleApplyCourse} />
                </Suspense>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      {facilities.length > 0 && (
        <section className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-5xl font-bold text-center mb-16 text-primary drop-shadow-lg">Our Facilities</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {facilities.slice(0, 4).map((facility, index) => (
                <div
                  key={facility._id?.toString()}
                  className="group overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 bg-white"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="h-56 bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                    {facility.image ? (
                      <img
                        src={facility.image || "/placeholder.svg"}
                        alt={facility.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-primary/30 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl">
                          <span className="text-3xl">🏫</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">Facility Image</p>
                      </div>
                    )}
                  </div>
                  <div className="p-8 bg-white">
                    <h4 className="font-bold text-xl mb-3 text-primary">{facility.title}</h4>
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
        <section className="py-20 bg-linear-to-br from-background to-card">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-5xl font-bold text-center mb-16 text-primary drop-shadow-lg">Student Testimonials</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <div key={testimonial._id?.toString()} style={{ animationDelay: `${index * 200}ms` }} className="animate-fade-in-up">
                  <Suspense fallback={<div className="h-80 bg-gray-200 rounded-xl animate-pulse shadow-lg" />}>
                    <TestimonialCard testimonial={testimonial} />
                  </Suspense>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Links Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 drop-shadow-lg">Quick Links</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <a
              href="/exams"
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-3xl"
            >
              <div className="text-5xl mb-4">📊</div>
              <h3 className="font-bold text-xl mb-3">Check MTS Result</h3>
              <p className="text-sm opacity-90">View your exam results online</p>
            </a>
            <a
              href="/contact"
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-3xl"
            >
              <div className="text-5xl mb-4">📞</div>
              <h3 className="font-bold text-xl mb-3">Contact Us</h3>
              <p className="text-sm opacity-90">Get in touch with our team</p>
            </a>
            <a
              href="/exams"
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-3xl"
            >
              <div className="text-5xl mb-4">📅</div>
              <h3 className="font-bold text-xl mb-3">Upcoming Exams</h3>
              <p className="text-sm opacity-90">Check exam schedules</p>
            </a>
            <a
              href="/success-stories"
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-3xl"
            >
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="font-bold text-xl mb-3">Success Stories</h3>
              <p className="text-sm opacity-90">Inspiring student journeys</p>
            </a>
          </div>
        </div>
      </section>

      {/* Enquiry Form Modal */}
      {showEnquiryForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-3xl transform animate-scale-in">
            <h3 className="text-3xl font-bold mb-8 text-center text-primary">
              {selectedCourse ? `Apply for ${selectedCourse.title}` : "Enquiry Form"}
            </h3>
            <form onSubmit={handleSubmitEnquiry} className="space-y-6">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                required
              />
              <input
                type="tel"
                placeholder="Your Mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                required
              />
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-linear-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowEnquiryForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse" />}>
        <Footer />
      </Suspense>
    </div>
  )
}
