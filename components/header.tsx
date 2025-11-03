"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Desktop Floating Navbar */}
      <nav className="hidden md:flex fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-primary/95 via-primary/90 to-secondary/95 backdrop-blur-xl rounded-2xl shadow-3xl border border-white/30 px-10 py-5 animate-fade-in-up hover:shadow-4xl transition-all duration-500 navbar-glow">
        <div className="flex items-center gap-10">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <span className="text-white font-bold text-lg">MG</span>
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-semibold text-white/90">Master's</div>
              <div className="text-xs font-semibold text-white">Gurukulam</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-8">
            <Link href="/" className="relative group px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <span className="text-sm font-medium text-white group-hover:text-white transition-colors duration-300">Home</span>
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-6"></span>
            </Link>
            <Link href="/about" className="relative group px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <span className="text-sm font-medium text-white group-hover:text-white transition-colors duration-300">About</span>
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-6"></span>
            </Link>
            <Link href="/exams" className="relative group px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <span className="text-sm font-medium text-white group-hover:text-white transition-colors duration-300">Exams</span>
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-6"></span>
            </Link>
            <Link href="/activities" className="relative group px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <span className="text-sm font-medium text-white group-hover:text-white transition-colors duration-300">Activities</span>
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-6"></span>
            </Link>
            <Link href="/contact" className="relative group px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <span className="text-sm font-medium text-white group-hover:text-white transition-colors duration-300">Contact</span>
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-6"></span>
            </Link>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-pulse shadow-lg"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary hover:scale-105 transition-transform duration-300">
            Master's Gurukulam
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="bg-white border-t border-gray-200 shadow-2xl animate-slide-down">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors duration-300 py-2">
                Home
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors duration-300 py-2">
                About
              </Link>
              <Link href="/exams" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors duration-300 py-2">
                Exams
              </Link>
              <Link href="/activities" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors duration-300 py-2">
                Activities
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors duration-300 py-2">
                Contact
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  )
}
