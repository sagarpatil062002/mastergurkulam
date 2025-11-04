"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Settings, Users, DollarSign, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import AdminLayout from "@/components/AdminLayout"

interface CRMConfig {
  provider: 'hubspot' | 'salesforce' | 'zoho' | 'pipedrive' | 'custom'
  apiKey?: string
  apiSecret?: string
  accessToken?: string
  baseUrl?: string
  enabled: boolean
}

interface CRMStats {
  totalContacts: number
  totalDeals: number
  totalRevenue: number
  conversionRate: number
  lastSync: string | null
  syncStatus: 'success' | 'error' | 'pending' | null
}

export default function CRMAdmin() {
  const [config, setConfig] = useState<CRMConfig>({
    provider: 'hubspot',
    enabled: false
  })
  const [stats, setStats] = useState<CRMStats>({
    totalContacts: 0,
    totalDeals: 0,
    totalRevenue: 0,
    conversionRate: 0,
    lastSync: null,
    syncStatus: null
  })
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadCRMConfig()
    loadCRMStats()
  }, [])

  const loadCRMConfig = async () => {
    try {
      // Load from localStorage or API
      const savedConfig = localStorage.getItem('crm_config')
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig))
      }
    } catch (error) {
      console.error('Error loading CRM config:', error)
    }
  }

  const loadCRMStats = async () => {
    try {
      // This would normally fetch from CRM API
      const mockStats: CRMStats = {
        totalContacts: 245,
        totalDeals: 67,
        totalRevenue: 335000,
        conversionRate: 27.3,
        lastSync: new Date().toISOString(),
        syncStatus: 'success'
      }
      setStats(mockStats)
    } catch (error) {
      console.error('Error loading CRM stats:', error)
    }
  }

  const saveConfig = async () => {
    try {
      localStorage.setItem('crm_config', JSON.stringify(config))
      alert('CRM configuration saved successfully!')
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Failed to save configuration')
    }
  }

  const testConnection = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initialize',
          data: { config }
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('CRM connection successful!')
      } else {
        alert('CRM connection failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Connection test error:', error)
      alert('Connection test failed')
    } finally {
      setTesting(false)
    }
  }

  const syncData = async () => {
    setSyncing(true)
    try {
      // This would sync all contacts and deals to CRM
      alert('Data synchronization started. This may take a few minutes.')
      // Simulate sync process
      setTimeout(() => {
        setSyncing(false)
        loadCRMStats()
        alert('Data synchronization completed!')
      }, 3000)
    } catch (error) {
      console.error('Sync error:', error)
      alert('Synchronization failed')
      setSyncing(false)
    }
  }

  const getProviderInfo = (provider: string) => {
    const providers = {
      hubspot: {
        name: 'HubSpot',
        docs: 'https://developers.hubspot.com/docs/api/crm/contacts',
        fields: ['apiKey']
      },
      salesforce: {
        name: 'Salesforce',
        docs: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_rest.htm',
        fields: ['accessToken', 'baseUrl']
      },
      zoho: {
        name: 'Zoho CRM',
        docs: 'https://www.zoho.com/crm/developer/docs/api/v2/',
        fields: ['apiKey']
      },
      pipedrive: {
        name: 'Pipedrive',
        docs: 'https://developers.pipedrive.com/docs/api/v1/',
        fields: ['apiKey']
      },
      custom: {
        name: 'Custom API',
        docs: '',
        fields: ['baseUrl', 'apiKey']
      }
    }
    return providers[provider as keyof typeof providers] || providers.hubspot
  }

  const providerInfo = getProviderInfo(config.provider)

  return (
    <AdminLayout>
      <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">CRM Integration</h2>
          <p className="text-gray-600 mt-2">Connect and sync data with your CRM system</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={testConnection}
            disabled={testing || !config.enabled}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {testing ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Test Connection
          </button>
          <button
            onClick={syncData}
            disabled={syncing || !config.enabled}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {syncing ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Sync Data
          </button>
        </div>
      </div>

      {/* CRM Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Contacts"
          value={stats.totalContacts.toString()}
          icon={<Users className="text-blue-600" size={24} />}
          change="+12%"
        />
        <StatCard
          title="Active Deals"
          value={stats.totalDeals.toString()}
          icon={<DollarSign className="text-green-600" size={24} />}
          change="+8%"
        />
        <StatCard
          title="Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="text-emerald-600" size={24} />}
          change="+15%"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon={<CheckCircle className="text-purple-600" size={24} />}
          change="+3%"
        />
      </div>

      {/* CRM Configuration */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-primary">CRM Configuration</h3>
          <p className="text-sm text-gray-600 mt-1">Configure your CRM integration settings</p>
        </div>
        <div className="p-6">
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Settings className="text-blue-600 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">CRM Integration Status</h4>
                <p className="text-blue-700 text-sm">
                  CRM integration allows you to automatically sync contacts, deals, and activities from your website to your CRM system.
                  Currently showing mock data for demonstration.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800">Enable CRM Integration</h4>
              <p className="text-sm text-gray-600">Turn on/off CRM data synchronization</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-bold mb-3 text-gray-700">CRM Provider</label>
            <select
              value={config.provider}
              onChange={(e) => setConfig({ ...config, provider: e.target.value as CRMConfig['provider'] })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="hubspot">HubSpot</option>
              <option value="salesforce">Salesforce</option>
              <option value="zoho">Zoho CRM</option>
              <option value="pipedrive">Pipedrive</option>
              <option value="custom">Custom API</option>
            </select>
          </div>

          {/* API Configuration */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">API Configuration</h4>

            {providerInfo.fields.includes('apiKey') && (
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">
                  API Key {config.provider === 'hubspot' && '(Private App Token)'}
                </label>
                <input
                  type="password"
                  value={config.apiKey || ''}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter your API key"
                />
              </div>
            )}

            {providerInfo.fields.includes('accessToken') && (
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Access Token</label>
                <input
                  type="password"
                  value={config.accessToken || ''}
                  onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter access token"
                />
              </div>
            )}

            {providerInfo.fields.includes('baseUrl') && (
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Base URL</label>
                <input
                  type="url"
                  value={config.baseUrl || ''}
                  onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="https://your-instance.salesforce.com"
                />
              </div>
            )}
          </div>

          {/* Documentation Link */}
          {providerInfo.docs && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-600 mt-1" size={20} />
                <div>
                  <h5 className="font-semibold text-blue-800 mb-1">Setup Documentation</h5>
                  <p className="text-blue-700 text-sm mb-2">
                    Need help configuring {providerInfo.name}? Check out their API documentation.
                  </p>
                  <a
                    href={providerInfo.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    View {providerInfo.name} API Docs →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={saveConfig}
              className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-primary">Synchronization Status</h3>
          <p className="text-sm text-gray-600 mt-1">Last sync and connection status</p>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold ${
                stats.syncStatus === 'success' ? 'bg-green-100 text-green-800' :
                stats.syncStatus === 'error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {stats.syncStatus === 'success' ? <CheckCircle size={16} /> :
                 stats.syncStatus === 'error' ? <XCircle size={16} /> :
                 <AlertCircle size={16} />}
                {stats.syncStatus === 'success' ? 'Connected' :
                 stats.syncStatus === 'error' ? 'Error' : 'Not Connected'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Last Sync</div>
              <div className="font-semibold">
                {stats.lastSync ? new Date(stats.lastSync).toLocaleString() : 'Never'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Provider</div>
              <div className="font-semibold capitalize">{config.provider}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent CRM Activities */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-primary">Recent CRM Activities</h3>
          <p className="text-sm text-gray-600 mt-1">Latest contacts and deals synced</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <CRMActivity
              icon="👤"
              title="New Contact Added"
              description="Rahul Sharma - UPSC Prelims 2025 registration"
              time="2 hours ago"
              type="contact"
            />
            <CRMActivity
              icon="💰"
              title="Deal Created"
              description="₹100 - UPSC Prelims Registration - REG-UPSC-001-2025"
              time="2 hours ago"
              type="deal"
            />
            <CRMActivity
              icon="📧"
              title="Contact Updated"
              description="Priya Patel - Payment completed for SSC CGL"
              time="4 hours ago"
              type="update"
            />
            <CRMActivity
              icon="📞"
              title="Lead Generated"
              description="Amit Kumar - Course enquiry for UPSC Civil Services"
              time="6 hours ago"
              type="lead"
            />
            <CRMActivity
              icon="⚠️"
              title="Grievance Logged"
              description="Issue reported for exam registration process"
              time="8 hours ago"
              type="issue"
            />
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}

function StatCard({
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
            {change} from last month
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  )
}

function CRMActivity({
  icon,
  title,
  description,
  time,
  type
}: {
  icon: string
  title: string
  description: string
  time: string
  type: 'contact' | 'deal' | 'update' | 'lead' | 'issue'
}) {
  const typeColors = {
    contact: 'bg-blue-100 border-blue-200 text-blue-800',
    deal: 'bg-green-100 border-green-200 text-green-800',
    update: 'bg-yellow-100 border-yellow-200 text-yellow-800',
    lead: 'bg-purple-100 border-purple-200 text-purple-800',
    issue: 'bg-red-100 border-red-200 text-red-800'
  }

  return (
    <div className={`p-4 rounded-lg border ${typeColors[type]} hover:shadow-md transition-all duration-300`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs opacity-75 mt-1">{description}</p>
          <p className="text-xs opacity-60 mt-2">{time}</p>
        </div>
      </div>
    </div>
  )
}