"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LogOut, Menu, X } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    // Get email from localStorage on client side
    const adminEmail = localStorage.getItem("adminEmail") || ""
    setEmail(adminEmail)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("adminEmail")
    localStorage.removeItem("adminRole")
    window.location.href = "/admin"
  }

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: "🏠" },
    { label: "Analytics", href: "/admin/analytics", icon: "📊" },
    { label: "CRM", href: "/admin/crm", icon: "🤝" },
    { label: "Admin Users", href: "/admin/admin-users", icon: "👥" },
    { label: "Email Templates", href: "/admin/email-templates", icon: "📧" },
    { label: "Courses", href: "/admin/courses", icon: "📚" },
    { label: "Faculty", href: "/admin/faculty", icon: "👨‍🏫" },
    { label: "Facilities", href: "/admin/facilities", icon: "🏫" },
    { label: "Testimonials", href: "/admin/testimonials", icon: "⭐" },
    { label: "Exams", href: "/admin/exams", icon: "📝" },
    { label: "Exam Registrations", href: "/admin/exam-registrations", icon: "📋" },
    { label: "Exam Results", href: "/admin/exam-results", icon: "📈" },
    { label: "Grievances", href: "/admin/grievances", icon: "⚠️" },
    { label: "Activities", href: "/admin/activities", icon: "📸" },
    { label: "Videos", href: "/admin/videos", icon: "🎥" },
    { label: "Contacts", href: "/admin/contacts", icon: "📞" },
    { label: "Notifications", href: "/admin/notifications", icon: "🔔" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">MG</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Master's Gurukulam</h1>
              <p className="text-sm text-gray-500">Admin Dashboard</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {email}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 flex items-center gap-2 transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? "block" : "hidden"
          } md:block w-full md:w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen`}
        >
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Management</h2>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary hover:text-white transition-all duration-200 group"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="w-full md:hidden mt-6 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}