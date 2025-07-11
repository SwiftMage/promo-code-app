'use client'

import { useState } from 'react'

export default function TestReddit() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    originalUrl?: string;
    cleanUrl?: string;
    attempts?: Array<{
      method: string;
      url: string;
      status: string | number;
      statusText?: string;
      success?: boolean;
      hasComments?: boolean;
      commentCount?: number;
      error?: string;
    }>;
    error?: string;
  } | null>(null)

  const testReddit = async () => {
    setLoading(true)
    setResults(null)
    
    try {
      const response = await fetch('/api/test-reddit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redditUrl: url })
      })
      
      const data = await response.json()
      setResults(data)
    } catch {
      setResults({ error: 'Failed to test Reddit URL' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Reddit URL Debug Tool</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <label className="block mb-2 font-medium text-gray-700">Reddit Post URL:</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.reddit.com/r/example/comments/..."
            className="w-full p-2 border rounded mb-4 bg-white text-gray-900 placeholder-gray-400"
          />
          
          <button
            onClick={testReddit}
            disabled={loading || !url}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Reddit URL'}
          </button>
        </div>
        
        {results && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Results:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm text-gray-800">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  )
}