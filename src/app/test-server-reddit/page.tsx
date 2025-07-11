'use client'

import { useState } from 'react'

export default function TestServerReddit() {
  const [url, setUrl] = useState('https://www.reddit.com/r/macapps/comments/1lu141s/updated_awesome_copy_giving_away_100_free_promo/')
  const [username, setUsername] = useState('BETO123USA')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  const testServerFetch = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/reddit-fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()
      
      // Add username check to the result
      if (data.success && data.usernames) {
        data.usernameFound = data.usernames.includes(username)
        data.totalUsernames = data.usernames.length
      }
      
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
            Test Server-Side Reddit Fetch
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-blue-800 text-sm">
              This test uses the server-side API endpoint directly, bypassing CORS proxies entirely.
            </p>
          </div>
          
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username to Check
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                placeholder="Reddit username"
              />
            </div>

            <button
              onClick={testServerFetch}
              disabled={loading || !url}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Testing Server-Side Fetch...' : 'Test Server-Side Reddit Fetch'}
            </button>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Raw Response:
                </h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              
              {result.success === true && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-md p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                    <p className="text-sm text-gray-600">
                      Total usernames found: <span className="font-semibold">{result.totalUsernames as number}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Comment text length: <span className="font-semibold">{(result.allCommentText as string)?.length || 0}</span>
                    </p>
                  </div>
                  
                  <div className={`border rounded-md p-4 ${
                    result.usernameFound 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <h4 className="font-medium mb-2">
                      {result.usernameFound 
                        ? '✅ Username Found!' 
                        : '❌ Username Not Found'
                      }
                    </h4>
                    <p className="text-sm">
                      {result.usernameFound 
                        ? `"${username}" has commented on this post`
                        : `"${username}" has not commented on this post`
                      }
                    </p>
                  </div>
                </div>
              )}

              {result.success === true && Array.isArray(result.usernames) && (
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    All Usernames ({(result.usernames as string[]).length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {(result.usernames as string[]).map((user: string, index: number) => (
                        <span
                          key={index}
                          className={`inline-block px-2 py-1 text-xs rounded ${
                            user === username
                              ? 'bg-green-100 text-green-800 font-semibold'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {result.error !== undefined && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800 font-medium">
                    ❌ Error: {result.error as string}
                  </p>
                  {result.details !== undefined && (
                    <p className="text-red-600 text-sm mt-1">
                      Details: {result.details as string}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-sm text-gray-600">
            <h4 className="font-medium text-gray-800 mb-2">Server-Side Benefits:</h4>
            <ul className="space-y-1">
              <li>• No CORS restrictions - direct Reddit access</li>
              <li>• More reliable than third-party proxies</li>
              <li>• Faster since no proxy middleman</li>
              <li>• Can add caching for better performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}