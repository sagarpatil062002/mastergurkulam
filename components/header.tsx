"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold text-primary hover:scale-105 transition-transform duration-300">
          Master's Gurukulam
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-10 items-center">
          <Link href="/" className="text-lg font-medium hover:text-primary transition-all duration-300 hover:scale-110">
            Home
          </Link>
          <Link href="/about" className="text-lg font-medium hover:text-primary transition-all duration-300 hover:scale-110">
            About
          </Link>
          <Link href="/exams" className="text-lg font-medium hover:text-primary transition-all duration-300 hover:scale-110">
            Exams
          </Link>
          <Link href="/activities" className="text-lg font-medium hover:text-primary transition-all duration-300 hover:scale-110">
            Activities
          </Link>
          <Link href="/contact" className="text-lg font-medium hover:text-primary transition-all duration-300 hover:scale-110">
            Contact
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200 shadow-2xl animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
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
  )
}
