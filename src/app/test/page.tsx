'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TestPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/validate')
        if (!response.ok) {
          router.push('/test/login')
          return
        }
        setLoading(false)
      } catch {
        router.push('/test/login')
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }
  const tests = [
    {
      title: 'reCAPTCHA v3 Test',
      description: 'Test reCAPTCHA v3 functionality with valid and invalid tokens',
      url: '/test-recaptcha-v3',
      category: 'Security',
      status: 'Active'
    },
    {
      title: 'Reddit Fetch Test (Client-side)',
      description: 'Test Reddit fetching using CORS proxies from the browser',
      url: '/test-reddit-fetch',
      category: 'Reddit Integration',
      status: 'Active'
    },
    {
      title: 'Reddit Fetch Test (Server-side)',
      description: 'Test Reddit fetching using server-side API without CORS restrictions',
      url: '/test-server-reddit',
      category: 'Reddit Integration',
      status: 'Active'
    },
    {
      title: 'Reddit Debug Page',
      description: 'Debug Reddit post verification and user extraction',
      url: '/test-reddit',
      category: 'Reddit Integration',
      status: 'Legacy'
    }
  ]

  const categories = [...new Set(tests.map(test => test.category))]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🧪 Test Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive testing suite for PromoCode App functionality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Tests</h3>
              <p className="text-2xl font-bold text-blue-600">{tests.length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Active Tests</h3>
              <p className="text-2xl font-bold text-green-600">
                {tests.filter(t => t.status === 'Active').length}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Categories</h3>
              <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
            </div>
          </div>

          {categories.map(category => (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                {category}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {tests
                  .filter(test => test.category === category)
                  .map((test, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {test.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            test.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {test.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {test.description}
                      </p>
                      
                      <div className="flex space-x-3">
                        <a
                          href={test.url}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Run Test
                        </a>
                        <a
                          href={test.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Open in New Tab
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Navigation</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/"
                className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors block"
              >
                <div className="text-2xl mb-2">🏠</div>
                <div className="text-sm font-medium text-blue-900">Home</div>
              </Link>
              
              <a
                href="/admin/dashboard"
                className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div className="text-sm font-medium text-purple-900">Admin</div>
              </a>
              
              <a
                href="/success?claimUrl=test&manageUrl=test"
                className="text-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="text-2xl mb-2">✅</div>
                <div className="text-sm font-medium text-green-900">Success Page</div>
              </a>
              
              <a
                href="/test-reddit"
                className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="text-2xl mb-2">🔧</div>
                <div className="text-sm font-medium text-orange-900">Legacy Tests</div>
              </a>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Development Notes</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• All tests run against localhost:3000 in development</li>
              <li>• reCAPTCHA tests require valid site keys in environment variables</li>
              <li>• Reddit tests may fail if Reddit blocks requests</li>
              <li>• Server-side tests are more reliable than client-side CORS proxy tests</li>
            </ul>
          </div>

          <div className="mt-4 text-right">
            <button
              onClick={() => {
                document.cookie = 'admin-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                router.push('/test/login')
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}