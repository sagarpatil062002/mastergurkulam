"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { BarChart3, Users, FileText, CreditCard, TrendingUp, Eye, MousePointer, Clock } from "lucide-react"

interface AnalyticsData {
  totalUsers: number
  totalEnquiries: number
  totalRegistrations: number
  totalRevenue: number
  pageViews: number
  uniqueVisitors: number
  bounceRate: number
  avgSessionDuration: number
  topPages: Array<{ page: string; views: number }>
  conversionFunnel: Array<{ step: string; count: number; rate: number }>
  recentActivity: Array<{ action: string; count: number; change: number }>
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      // This would normally fetch from Google Analytics API
      // For now, we'll simulate with mock data
      const mockData: AnalyticsData = {
        totalUsers: 1250,
        totalEnquiries: 89,
        totalRegistrations: 45,
        totalRevenue: 22500,
        pageViews: 8750,
        uniqueVisitors: 2100,
        bounceRate: 42.5,
        avgSessionDuration: 185,
        topPages: [
          { page: "/exams", views: 1250 },
          { page: "/", views: 980 },
          { page: "/about", views: 720 },
          { page: "/courses", views: 650 },
          { page: "/contact", views: 480 }
        ],
        conversionFunnel: [
          { step: "Page Views", count: 8750, rate: 100 },
          { step: "Course Enquiries", count: 89, rate: 1.02 },
          { step: "Exam Registrations", count: 45, rate: 0.51 },
          { step: "Payments Completed", count: 38, rate: 0.43 }
        ],
        recentActivity: [
          { action: "Course Enquiries", count: 12, change: 15.2 },
          { action: "Exam Registrations", count: 8, change: 23.1 },
          { action: "Contact Forms", count: 15, change: -5.3 },
          { action: "PDF Downloads", count: 25, change: 8.7 }
        ]
      }

      setAnalyticsData(mockData)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-2">Loading analytics data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">Analytics Unavailable</h3>
          <p>Please check your Google Analytics configuration.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-2">Track user behavior and website performance</p>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as "7d" | "30d" | "90d")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                timeRange === range
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={analyticsData.totalUsers.toLocaleString()}
          icon={<Users className="text-blue-600" size={24} />}
          change="+12.5%"
        />
        <MetricCard
          title="Page Views"
          value={analyticsData.pageViews.toLocaleString()}
          icon={<Eye className="text-green-600" size={24} />}
          change="+8.2%"
        />
        <MetricCard
          title="Unique Visitors"
          value={analyticsData.uniqueVisitors.toLocaleString()}
          icon={<TrendingUp className="text-purple-600" size={24} />}
          change="+15.3%"
        />
        <MetricCard
          title="Avg. Session"
          value={formatDuration(analyticsData.avgSessionDuration)}
          icon={<Clock className="text-orange-600" size={24} />}
          change="+5.7%"
        />
      </div>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Course Enquiries"
          value={analyticsData.totalEnquiries.toString()}
          icon={<FileText className="text-indigo-600" size={24} />}
          change="+18.4%"
        />
        <MetricCard
          title="Exam Registrations"
          value={analyticsData.totalRegistrations.toString()}
          icon={<Users className="text-teal-600" size={24} />}
          change="+22.1%"
        />
        <MetricCard
          title="Revenue"
          value={formatCurrency(analyticsData.totalRevenue)}
          icon={<CreditCard className="text-emerald-600" size={24} />}
          change="+31.7%"
        />
        <MetricCard
          title="Bounce Rate"
          value={`${analyticsData.bounceRate}%`}
          icon={<MousePointer className="text-red-600" size={24} />}
          change="-3.2%"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Pages */}
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-primary">Top Pages</h3>
            <p className="text-sm text-gray-600 mt-1">Most visited pages</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium">{page.page}</span>
                  </div>
                  <span className="text-gray-600">{page.views.toLocaleString()} views</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-primary">Conversion Funnel</h3>
            <p className="text-sm text-gray-600 mt-1">User journey analysis</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.conversionFunnel.map((step, index) => (
                <div key={step.step} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="font-medium">{step.step}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary">{step.count.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 ml-2">({step.rate}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-primary">Recent Activity</h3>
          <p className="text-sm text-gray-600 mt-1">Key metrics performance</p>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsData.recentActivity.map((activity) => (
              <div key={activity.action} className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">{activity.count}</div>
                <div className="text-sm text-gray-600 mb-2">{activity.action}</div>
                <div className={`text-xs font-semibold ${
                  activity.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {activity.change > 0 ? '+' : ''}{activity.change}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Configuration Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <BarChart3 className="text-blue-600 mt-1" size={24} />
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Analytics Configuration</h4>
            <p className="text-blue-700 text-sm mb-3">
              To get real analytics data, configure Google Analytics 4 and Microsoft Clarity:
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Replace <code className="bg-blue-100 px-1 rounded">GA_MEASUREMENT_ID</code> with your GA4 Measurement ID</li>
              <li>• Replace <code className="bg-blue-100 px-1 rounded">CLARITY_PROJECT_ID</code> with your Microsoft Clarity Project ID</li>
              <li>• Set up proper API credentials for real-time data fetching</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon,
  change
}: {
  title: string
  value: string
  icon: React.ReactNode
  change: string
}) {
  const isPositive = change.startsWith('+')

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          <p className={`text-sm font-semibold mt-1 ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {change} from last period
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  )
}