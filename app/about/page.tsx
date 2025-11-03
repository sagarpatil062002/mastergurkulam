"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import type { Faculty, Facility, Course } from "@/lib/db-models"

export default function About() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/faculty").then((r) => r.json()),
      fetch("/api/facilities").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
    ]).then(([f, fac, c]) => {
      setFaculty(f)
      setFacilities(fac)
      setCourses(c)
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Academy Overview */}
      <section className="py-20 bg-gradient-to-br from-background to-card">
        <div className="max-w-6xl mx-auto w-full px-4">
          <h1 className="text-5xl font-bold mb-12 text-center text-primary">About Master's Gurukulam</h1>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-3xl font-bold mb-6 text-primary">Our Mission</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  To provide quality education and comprehensive exam preparation that empowers students to achieve academic
                  excellence and realize their full potential through innovative teaching methods and personalized guidance.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-3xl font-bold mb-6 text-primary">Our Vision</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  To be a leading educational institute recognized for innovation, student success, and meaningful contribution to
                  society by nurturing future leaders and professionals.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-8 text-white shadow-lg">
              <h2 className="text-3xl font-bold mb-8">Why Choose Us?</h2>
              <ul className="space-y-4 text-lg">
                <li className="flex items-center">
                  <span className="text-2xl mr-3">✓</span>
                  Experienced faculty members with proven expertise
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">✓</span>
                  Modern facilities and state-of-the-art infrastructure
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">✓</span>
                  Comprehensive course curriculum designed for success
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">✓</span>
                  Personalized student support and mentorship
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">✓</span>
                  Proven track record of student success and achievements
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Section */}
      {faculty.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-card to-background">
          <div className="max-w-6xl mx-auto px-4 w-full">
            <h2 className="text-4xl font-bold mb-16 text-center text-primary">Our Faculty</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {faculty.map((member) => (
                <div
                  key={member._id?.toString()}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                    {member.image ? (
                      <img
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-primary/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-3xl text-primary">👨‍🏫</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Faculty Photo</p>
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-2 text-primary">{member.name}</h3>
                    <p className="text-lg text-secondary font-semibold mb-3">{member.subject}</p>
                    <p className="text-sm text-muted-foreground mb-4 font-medium">{member.qualification}</p>
                    <p className="text-sm leading-relaxed text-gray-700">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Facilities Section */}
      {facilities.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-background to-card">
          <div className="max-w-6xl mx-auto px-4 w-full">
            <h2 className="text-4xl font-bold mb-16 text-center text-primary">Our Facilities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {facilities.map((facility) => (
                <div key={facility._id?.toString()} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                    {facility.image ? (
                      <img
                        src={facility.image || "/placeholder.svg"}
                        alt={facility.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-primary/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-3xl text-primary">🏫</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Facility Image</p>
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-4 text-primary">{facility.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{facility.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Courses Summary */}
      {courses.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
          <div className="max-w-6xl mx-auto px-4 w-full">
            <h2 className="text-4xl font-bold mb-16 text-center">Programs Offered</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course._id?.toString()} className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <h3 className="text-2xl font-bold mb-4 text-white">{course.title}</h3>
                  <p className="text-lg opacity-90 mb-4">Duration: {course.duration}</p>
                  <p className="text-white/90 leading-relaxed">{course.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
