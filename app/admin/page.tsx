"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LogOut, Menu, X } from "lucide-react"

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

  const handleLogout = () => {
    localStorage.removeItem("adminEmail")
    localStorage.removeItem("adminRole")
    setIsLoggedIn(false)
    setEmail("")
    setPassword("")
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
            <Nav />
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
          <Dashboard />
        </main>
      </div>
    </div>
  )
}

function Nav() {
  const menuItems = [
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
  ]

  return (
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
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/courses" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors">
              <div className="text-2xl mb-2">➕</div>
              <div className="font-semibold text-blue-800">Add Course</div>
            </Link>
            <Link href="/admin/exams" className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-semibold text-green-800">Create Exam</div>
            </Link>
            <Link href="/admin/faculty" className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors">
              <div className="text-2xl mb-2">👤</div>
              <div className="font-semibold text-purple-800">Add Faculty</div>
            </Link>
            <Link href="/admin/contacts" className="bg-orange-50 hover:bg-orange-100 p-4 rounded-lg transition-colors">
              <div className="text-2xl mb-2">💬</div>
              <div className="font-semibold text-orange-800">View Messages</div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New course added</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Exam registration received</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
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
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
