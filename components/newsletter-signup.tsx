"use client"

import type React from "react"

import { useState } from "react"

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Successfully subscribed to newsletter!" })
        setEmail("")
        setName("")
      } else {
        setMessage({ type: "error", text: data.error || "Failed to subscribe" })
      }
    } catch (error) {
      console.error("Newsletter signup error:", error)
      setMessage({ type: "error", text: "Failed to subscribe. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6">
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">📧</div>
        <h3 className="text-xl font-bold text-primary mb-2">Stay Updated</h3>
        <p className="text-sm text-muted-foreground">
          Subscribe to our newsletter for exam updates, success stories, and educational tips
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Your Name (Optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-2 border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Your Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transform hover:scale-105 transition-all duration-300"
        >
          {loading ? "📤 Subscribing..." : "📧 Subscribe"}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          message.type === "success"
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}