'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CodeInputForm() {
  const [codes, setCodes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codes }),
      })

      if (!response.ok) {
        throw new Error('Failed to create campaign')
      }

      const data = await response.json()
      router.push(`/success?claimUrl=${encodeURIComponent(data.claimUrl)}&manageUrl=${encodeURIComponent(data.manageUrl)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Your Campaign</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="codes" className="block text-sm font-medium text-gray-700 mb-2">
            Promo Codes
          </label>
          <textarea
            id="codes"
            value={codes}
            onChange={(e) => setCodes(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your promo codes here, separated by commas, spaces, or new lines:

SAVE10
WELCOME20
DISCOUNT15
PROMO2024"
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Each visitor will receive one unique code from your list
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !codes.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Creating Campaign...' : 'Create Campaign'}
        </button>
      </form>
    </div>
  )
}