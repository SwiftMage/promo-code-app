'use client'

import { useEffect, useState } from 'react'

interface ManagePageProps {
  params: Promise<{
    slug: string
  }>
}

interface CampaignStats {
  campaignId: string
  totalCodes: number
  claimedCodes: number
  createdAt: string
  expiresAt?: string
}

interface PromoCode {
  id: string
  value: string
  claimedBy?: string
  claimedAt?: string
  redditUsername?: string
}

export default function ManagePage({ params }: ManagePageProps) {
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'codes'>('overview')

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/manage/${resolvedParams.slug}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch campaign data')
        }
        
        const data = await response.json()
        setStats(data.stats)
        setCodes(data.codes)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCampaignData()
  }, [params])

  const exportCodes = () => {
    const csv = [
      ['Code', 'Status', 'Claimed At', 'Claimed By Hash', 'Reddit Username'],
      ...codes.map(code => [
        code.value,
        code.claimedBy ? 'Claimed' : 'Available',
        code.claimedAt || '',
        code.claimedBy || '',
        code.redditUsername || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `promo-codes-${stats?.campaignId}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading campaign data...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {error}
            </p>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Possible Issues:
              </h2>
              <ul className="text-gray-600 space-y-2 text-left">
                <li>• Invalid or expired management link</li>
                <li>• Campaign may have been deleted</li>
                <li>• Link may be corrupted or incomplete</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!stats) return null

  const claimRate = stats.totalCodes > 0 ? (stats.claimedCodes / stats.totalCodes) * 100 : 0

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Campaign Management
            </h1>
            <p className="text-xl text-gray-600">
              Campaign ID: {stats.campaignId}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('codes')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'codes'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Promo Codes
                </button>
              </nav>
            </div>

            {activeTab === 'overview' && (
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="text-2xl font-bold text-blue-900 mb-2">
                      {stats.totalCodes}
                    </div>
                    <div className="text-blue-700">Total Codes</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="text-2xl font-bold text-green-900 mb-2">
                      {stats.claimedCodes}
                    </div>
                    <div className="text-green-700">Claimed Codes</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6">
                    <div className="text-2xl font-bold text-purple-900 mb-2">
                      {claimRate.toFixed(1)}%
                    </div>
                    <div className="text-purple-700">Claim Rate</div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress</h3>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${claimRate}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {stats.claimedCodes} of {stats.totalCodes} codes claimed
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Campaign Details
                    </h3>
                    <div className="space-y-2 text-sm text-gray-900">
                      <div>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(stats.createdAt).toLocaleDateString()}
                      </div>
                      {stats.expiresAt && (
                        <div>
                          <span className="font-medium">Expires:</span>{' '}
                          {new Date(stats.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Status:</span>{' '}
                        <span className="text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Actions
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={exportCodes}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm font-medium"
                      >
                        Export Code List
                      </button>
                      <button
                        onClick={() => {
                          const claimUrl = `${window.location.origin}/claim/${stats.campaignId}`
                          navigator.clipboard.writeText(claimUrl)
                        }}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 text-sm font-medium"
                      >
                        Copy Claim Link
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">Visitor Identification System</h4>
                  <p className="text-xs text-yellow-700 mb-2">
                    Each visitor is identified using a combination of their IP address and browser fingerprint (User-Agent). 
                    This creates a unique hash that ensures most users receive only one code per campaign.
                  </p>
                  <p className="text-xs text-yellow-700 mb-2">
                    <strong>Limitations:</strong> Users can potentially bypass this by using different devices, networks, 
                    incognito mode, or VPNs. This system provides reasonable protection for honest users but cannot prevent 
                    determined abuse.
                  </p>
                  <p className="text-xs text-yellow-700">
                    <strong>Data Retention:</strong> Campaigns and all associated data are automatically deleted after 30 days 
                    for privacy and storage optimization.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'codes' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Promo Codes ({codes.length})
                  </h3>
                  <button
                    onClick={exportCodes}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    Export CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">
                          Code
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">
                          Claimed At
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">
                          Reddit Username
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">
                          Visitor ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {codes.map((code) => (
                        <tr key={code.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-gray-900">
                            {code.value}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                code.claimedBy
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {code.claimedBy ? 'Claimed' : 'Available'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {code.claimedAt
                              ? new Date(code.claimedAt).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {code.redditUsername ? (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                u/{code.redditUsername}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                            {code.claimedBy ? code.claimedBy.substring(0, 12) + '...' : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}