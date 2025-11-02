"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          Master's Gurukulam
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link href="/" className="hover:text-primary transition">
            Home
          </Link>
          <Link href="/about" className="hover:text-primary transition">
            About
          </Link>
          <Link href="/exams" className="hover:text-primary transition">
            Exams
          </Link>
          <Link href="/activities" className="hover:text-primary transition">
            Activities
          </Link>
          <Link href="/contact" className="hover:text-primary transition">
            Contact
          </Link>
          <Link
            href="/admin"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition"
          >
            Admin
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-card border-t border-border">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <Link href="/exams" onClick={() => setMobileMenuOpen(false)}>
              Exams
            </Link>
            <Link href="/activities" onClick={() => setMobileMenuOpen(false)}>
              Activities
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
            <Link href="/admin" className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
              Admin
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
