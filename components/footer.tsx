import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"
import NewsletterSignup from "./newsletter-signup"

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Master's Gurukulam</h3>
            <p className="opacity-90">Providing quality education and exam preparation since 2010.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 opacity-90">
              <li>
                <Link href="/exams" className="hover:opacity-100">
                  Exams
                </Link>
              </li>
              <li>
                <Link href="/activities" className="hover:opacity-100">
                  Activities
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="hover:opacity-100">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:opacity-100">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact Info</h4>
            <div className="space-y-2 opacity-90">
              <p className="flex items-center gap-2">
                <Phone size={16} /> +91 XXXX XXXX XX
              </p>
              <p className="flex items-center gap-2">
                <Mail size={16} /> info@mastersgurukulam.com
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={16} /> City, State, India
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="max-w-md mx-auto mb-8">
          <NewsletterSignup />
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center opacity-75">
          <p>&copy; 2025 Master's Gurukulam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
