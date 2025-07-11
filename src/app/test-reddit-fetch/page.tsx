'use client'

import { useState } from 'react'

export default function TestRedditFetch() {
  const [url, setUrl] = useState('https://www.reddit.com/r/macapps/comments/1lu141s/updated_awesome_copy_giving_away_100_free_promo/')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  const testFetch = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-reddit-fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Test failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Test Reddit Fetch
          </h1>
          
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reddit URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                placeholder="https://www.reddit.com/r/..."
              />
            </div>

            <button
              onClick={testFetch}
              disabled={loading || !url}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Testing...' : 'Test Reddit Fetch'}
            </button>
          </div>

          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Test Result:
              </h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
              
              {result.hasTargetUser === false && (
                <div className="mt-4 p-3 rounded-md bg-yellow-50 border border-yellow-200">
                  <p className="text-yellow-800 font-medium">
                    ⚠️ BETO123USA not found in extracted usernames
                  </p>
                  <p className="text-yellow-600 text-sm mt-1">
                    Found {result.usernamesFound as number} usernames total
                  </p>
                </div>
              )}
              
              {result.hasTargetUser === true && (
                <div className="mt-4 p-3 rounded-md bg-green-50 border border-green-200">
                  <p className="text-green-800 font-medium">
                    ✅ BETO123USA found successfully!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}