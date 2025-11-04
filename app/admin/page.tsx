"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { LogOut, Menu, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminHome() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  useEffect(() => {
    const sessionEmail = localStorage.getItem("adminEmail")
    if (sessionEmail) {
      setIsLoggedIn(true)
      setEmail(sessionEmail)
    }
    setLoading(false)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, action: "login" }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("adminEmail", data.email)
        localStorage.setItem("adminRole", data.role)
        setIsLoggedIn(true)
        setEmail(data.email)
      } else {
        setLoginError("Invalid email or password")
      }
    } catch (error) {
      setLoginError("Login failed")
      console.error(error)
    }
  }

  // Check for secret access code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const accessCode = urlParams.get('access')
    if (accessCode !== 'admin2024') {
      // Only redirect if not already logged in
      const sessionEmail = localStorage.getItem("adminEmail")
      if (!sessionEmail) {
        window.location.href = '/'
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("adminEmail")
    localStorage.removeItem("adminRole")
    setIsLoggedIn(false)
    setEmail("")
    setPassword("")
    // Redirect to home page
    window.location.href = "/"
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-secondary flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Portal</h1>
            <p className="text-gray-600">Master's Gurukulam Management System</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="admin@mastersgurukulam.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Enter your password"
                required
              />
            </div>
            {loginError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
                ⚠️ {loginError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              🔓 Sign In to Dashboard
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Secure admin access • Authorized personnel only
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-2xl border-b border-gray-200 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-lg">MG</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Master's Gurukulam</h1>
              <p className="text-sm text-gray-500">Admin Dashboard</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {email}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? "block" : "hidden"
          } md:block w-full md:w-72 bg-white shadow-lg border-r border-gray-200 flex flex-col`}
        >
          <div className="p-6 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Management</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="px-4 h-full">
              <Nav />
            </div>
          </div>
          <div className="p-6 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full md:hidden bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 flex items-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Dashboard />
        </main>
      </div>
    </div>
  )
}

function Nav() {
  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Admin Users", href: "/admin/admin-users", icon: "👥" },
    { label: "Email Templates", href: "/admin/email-templates", icon: "📧" },
    { label: "Courses", href: "/admin/courses", icon: "📚" },
    { label: "Faculty", href: "/admin/faculty", icon: "👨‍🏫" },
    { label: "Facilities", href: "/admin/facilities", icon: "🏫" },
    { label: "Testimonials", href: "/admin/testimonials", icon: "⭐" },
    { label: "Exams", href: "/admin/exams", icon: "📝" },
    { label: "Exam Registrations", href: "/admin/exam-registrations", icon: "📋" },
    { label: "Grievances", href: "/admin/grievances", icon: "⚠️" },
    { label: "Activities", href: "/admin/activities", icon: "📸" },
    { label: "Videos", href: "/admin/videos", icon: "🎥" },
    { label: "Contacts", href: "/admin/contacts", icon: "📞" },
    { label: "FAQs", href: "/admin/faqs", icon: "❓" },
    { label: "Notifications", href: "/admin/notifications", icon: "📢" },
    { label: "Analytics", href: "/admin/analytics", icon: "📊" },
    { label: "CRM Integration", href: "/admin/crm", icon: "🤝" },
  ]

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const container = e.currentTarget as HTMLElement
    container.scrollTop += e.deltaY
  }

  const isActive = (href: string) => {
    if (typeof window !== 'undefined') {
      return window.location.pathname === href
    }
    return false
  }

  return (
    <nav
      className="space-y-1 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 bg-gray-50 rounded-lg p-2"
      onWheel={handleWheel}
      style={{ scrollbarWidth: 'thin' }}
    >
      {menuItems.map((item, index) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group block ${
              active
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                : 'hover:bg-white hover:shadow-md text-gray-700 hover:text-gray-900'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className={`text-lg ${active ? '' : 'group-hover:animate-bounce'}`}>{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function Dashboard() {
  const [stats, setStats] = useState({
    courses: 0,
    faculty: 0,
    exams: 0,
    registrations: 0,
    contacts: 0,
    activities: 0
  })

  useEffect(() => {
    // Fetch real-time stats
    Promise.all([
      fetch('/api/courses').then(r => r.json()),
      fetch('/api/faculty').then(r => r.json()),
      fetch('/api/exams').then(r => r.json()),
      fetch('/api/exam-registrations').then(r => r.json()),
      fetch('/api/contacts').then(r => r.json()),
      fetch('/api/activities').then(r => r.json())
    ]).then(([courses, faculty, exams, registrations, contacts, activities]) => {
      setStats({
        courses: courses.length,
        faculty: faculty.length,
        exams: exams.length,
        registrations: registrations.length,
        contacts: contacts.length,
        activities: activities.length
      })
    }).catch(console.error)
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your institute.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium">{new Date().toLocaleString()}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Courses" value={stats.courses.toString()} icon="📚" color="blue" />
        <StatCard title="Faculty Members" value={stats.faculty.toString()} icon="👨‍🏫" color="green" />
        <StatCard title="Active Exams" value={stats.exams.toString()} icon="📝" color="purple" />
        <StatCard title="Exam Registrations" value={stats.registrations.toString()} icon="📋" color="orange" />
        <StatCard title="Contact Messages" value={stats.contacts.toString()} icon="📞" color="red" />
        <StatCard title="Activities" value={stats.activities.toString()} icon="📸" color="indigo" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/courses" className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
              <div className="text-2xl mb-2">➕</div>
              <div className="font-semibold text-blue-800">Add Course</div>
            </Link>
            <Link href="/admin/exams" className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-semibold text-green-800">Create Exam</div>
            </Link>
            <Link href="/admin/faculty" className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
              <div className="text-2xl mb-2">👤</div>
              <div className="font-semibold text-purple-800">Add Faculty</div>
            </Link>
            <Link href="/admin/contacts" className="bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 p-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
              <div className="text-2xl mb-2">💬</div>
              <div className="font-semibold text-orange-800">View Messages</div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-all duration-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New course added</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-all duration-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Exam registration received</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-all duration-300">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Contact form submission</p>
                <p className="text-xs text-gray-500">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    indigo: "bg-indigo-500"
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center text-white text-xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="text-right">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="w-12 h-12 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
