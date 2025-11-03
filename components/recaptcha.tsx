"use client"

import { useRef, useEffect } from "react"
import ReCAPTCHA from "react-google-recaptcha"

interface RecaptchaProps {
  onVerify: (token: string | null) => void
  onExpired?: () => void
  siteKey?: string
}

export default function Recaptcha({ onVerify, onExpired, siteKey = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" }: RecaptchaProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const handleChange = (token: string | null) => {
    onVerify(token)
  }

  const handleExpired = () => {
    onExpired?.()
  }

  return (
    <ReCAPTCHA
      ref={recaptchaRef}
      sitekey={siteKey}
      onChange={handleChange}
      onExpired={handleExpired}
      size="normal"
      theme="light"
    />
  )
}