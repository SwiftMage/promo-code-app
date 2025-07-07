'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalCampaigns: number
  activeCampaigns: number
  totalPromoCodes: number
  claimedCodes: number
  uniqueVisitors: number
  recentCampaigns: number
  recentClaims: number
  claimRate: number
  dailyActivity: Array<{ date: string; claims: number }>
  topCampaigns: Array<{
    id: string
    totalCodes: number
    claimedCodes: number
    percentageClaimed: number
    createdAt: string
    expiresAt: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      
      if (response.status === 401) {
        router.push('/admin/login')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const fixDates = async () => {
    try {
      const response = await fetch('/api/admin/fix-dates', { method: 'POST' })
      const data = await response.json()
      alert(`Fixed ${data.fixedCount} campaigns with invalid dates`)
      fetchStats() // Refresh the data
    } catch {
      alert('Failed to fix dates')
    }
  }

  const logout = async () => {
    document.cookie = 'admin-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">PromoDistro Admin Dashboard</h1>
          <div className="flex space-x-3">
            <button
              onClick={fixDates}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Fix Dates
            </button>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Campaigns</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalCampaigns || 0}</p>
            <p className="text-sm text-gray-600 mt-1">
              {stats?.activeCampaigns || 0} active
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Unique Visitors</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.uniqueVisitors || 0}</p>
            <p className="text-sm text-gray-600 mt-1">
              {stats?.recentClaims || 0} recent claims
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Promo Codes</h3>
            <p className="text-3xl font-bold text-purple-600">{stats?.totalPromoCodes || 0}</p>
            <p className="text-sm text-gray-600 mt-1">
              {stats?.claimedCodes || 0} claimed ({stats?.claimRate || 0}%)
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Activity</h3>
            <p className="text-3xl font-bold text-orange-600">{stats?.recentCampaigns || 0}</p>
            <p className="text-sm text-gray-600 mt-1">
              campaigns last 30 days
            </p>
          </div>
        </div>

        {/* Daily Activity Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Claims (Last 7 Days)</h3>
          <div className="flex items-end space-x-2 h-48">
            {stats?.dailyActivity.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div
                  className="bg-blue-600 w-full rounded-t"
                  style={{ height: `${Math.max((day.claims / Math.max(...stats.dailyActivity.map(d => d.claims), 1)) * 100, 5)}%` }}
                ></div>
                <p className="text-xs text-gray-600 mt-2 transform rotate-45">{day.date}</p>
                <p className="text-xs font-semibold text-gray-900">{day.claims}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Campaigns */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Campaigns by Usage</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Campaign ID</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Total Codes</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Claimed</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Success Rate</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Created</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Expires</th>
                </tr>
              </thead>
              <tbody>
                {stats?.topCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b">
                    <td className="py-2 px-4 text-sm text-gray-900 font-mono">{campaign.id}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{campaign.totalCodes}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{campaign.claimedCodes}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.percentageClaimed >= 80 ? 'bg-green-100 text-green-800' :
                        campaign.percentageClaimed >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {campaign.percentageClaimed}%
                      </span>
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-900">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-900">
                      {new Date(campaign.expiresAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}