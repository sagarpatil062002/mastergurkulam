"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import type { Notification } from "@/lib/db-models"

export default function NotificationBar() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    if (notifications.length > 0) {
      setCurrentNotification(notifications[0])
      setIsVisible(true)
    }
  }, [notifications])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const dismissNotification = () => {
    setIsVisible(false)
    // Move to next notification after animation
    setTimeout(() => {
      const currentIndex = notifications.findIndex(n => n._id === currentNotification?._id)
      if (currentIndex < notifications.length - 1) {
        setCurrentNotification(notifications[currentIndex + 1])
        setIsVisible(true)
      } else {
        setCurrentNotification(null)
      }
    }, 300)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-600" size={20} />
      case "warning":
        return <AlertTriangle className="text-yellow-600" size={20} />
      case "error":
        return <AlertCircle className="text-red-600" size={20} />
      default:
        return <Info className="text-blue-600" size={20} />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  if (!currentNotification || !isVisible) return null

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className={`${getBgColor(currentNotification.type)} border-b px-4 py-3 shadow-lg`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {getIcon(currentNotification.type)}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-sm">{currentNotification.title}</h4>
              <p className="text-gray-700 text-sm mt-1">{currentNotification.message}</p>
            </div>
          </div>
          <button
            onClick={dismissNotification}
            className="ml-4 p-1 hover:bg-black/10 rounded-full transition-colors duration-200"
            aria-label="Dismiss notification"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}