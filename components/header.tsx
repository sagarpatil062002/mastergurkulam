"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Desktop Floating Navbar */}
      <nav className="hidden md:flex fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 backdrop-blur-lg rounded-full shadow-2xl border border-gray-200/50 px-8 py-4 animate-fade-in-up">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-primary hover:scale-110 transition-all duration-300">
            MG
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-110 relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-110 relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/exams" className="text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-110 relative group">
              Exams
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/activities" className="text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-110 relative group">
              Activities
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-110 relative group">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
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
