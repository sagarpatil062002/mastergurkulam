"use client"

import type React from "react"

import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Mail, Phone, MapPin, Clock, Facebook, Youtube, Instagram, Twitter } from "lucide-react"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    type: "general",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setSubmitted(true)
        setFormData({ name: "", email: "", mobile: "", type: "general", message: "" })
        setTimeout(() => setSubmitted(false), 5000)
      }
    } catch (error) {
      console.error("Contact error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-secondary text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Get in touch with Master's Gurukulam. We're here to help you with admissions, exams, and all your educational needs.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background flex-1">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-primary">Get In Touch</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about our courses, admissions, or exam procedures? Reach out to us through any of the channels below.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 mb-16">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="text-primary" size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-primary">Phone</h3>
                  </div>
                </div>
                <p className="text-muted-foreground text-lg">+91 XXXX XXXX XX</p>
                <p className="text-muted-foreground text-lg">+91 XXXX XXXX XX</p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="text-primary" size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-primary">Email</h3>
                  </div>
                </div>
                <p className="text-muted-foreground text-lg">info@mastersgurukulam.com</p>
                <p className="text-muted-foreground text-lg">admissions@mastersgurukulam.com</p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="text-primary" size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-primary">Address</h3>
                  </div>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Master's Gurukulam<br />
                  Education Complex<br />
                  City, State - PIN<br />
                  India
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Clock className="text-primary" size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-primary">Working Hours</h3>
                  </div>
                </div>
                <div className="text-muted-foreground space-y-1">
                  <p className="text-lg"><strong>Mon - Fri:</strong> 9:00 AM - 6:00 PM</p>
                  <p className="text-lg"><strong>Saturday:</strong> 10:00 AM - 2:00 PM</p>
                  <p className="text-lg"><strong>Sunday:</strong> Closed</p>
                </div>
              </div>
            </div>

            {/* Contact Form & Map */}
            <div className="lg:col-span-2 space-y-12">
              {/* Contact Form */}
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-3xl font-bold mb-8 text-primary">Send us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-lg font-bold mb-3 text-primary">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-bold mb-3 text-primary">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-lg font-bold mb-3 text-primary">Mobile Number</label>
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter your mobile number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-bold mb-3 text-primary">Inquiry Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="general">📝 General Inquiry</option>
                        <option value="admission">🎓 Admission</option>
                        <option value="exam">📊 Exam Related</option>
                        <option value="other">❓ Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-lg font-bold mb-3 text-primary">Your Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full border-2 border-border rounded-xl px-6 py-4 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      placeholder="Please describe your inquiry in detail..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    {loading ? "📤 Sending Message..." : "📤 Send Message"}
                  </button>
                </form>
                {submitted && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl">
                    <div className="text-center">
                      <div className="text-4xl mb-3">✅</div>
                      <p className="text-xl text-green-800 font-bold">Thank you for contacting us!</p>
                      <p className="text-green-700 mt-2">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Section */}
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-3xl font-bold mb-8 text-primary">📍 Find Us</h3>
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d955.2964043501386!2d74.31178100898867!3d16.717587787116997!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1030078f20593%3A0x919429bf2ddec8af!2sMASTERS%20GURUKULAM%20(IIT%2C%20MEDICAL%20%26%20DEFENCE%20ACADEMY)!5e0!3m2!1sen!2sin!4v1762094434389!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Master's Gurukulam Location"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-lg text-primary font-semibold">
                    Master's Gurukulam<br />
                    Education Complex<br />
                    City, State, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <h3 className="text-3xl font-bold mb-8">Follow Us on Social Media</h3>
              <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto">
                Stay connected with Master's Gurukulam for the latest updates, educational content, and community events.
              </p>
              <div className="flex justify-center gap-8">
                <a
                  href="#"
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook size={32} />
                </a>
                <a
                  href="#"
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                  aria-label="YouTube"
                >
                  <Youtube size={32} />
                </a>
                <a
                  href="#"
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram size={32} />
                </a>
                <a
                  href="#"
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                  aria-label="Twitter"
                >
                  <Twitter size={32} />
                </a>
              </div>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </div>
  )
}
