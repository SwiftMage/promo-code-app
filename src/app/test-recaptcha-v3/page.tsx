'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

export default function TestRecaptchaV3() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [recaptchaReady, setRecaptchaReady] = useState(false)

  useEffect(() => {
    const loadRecaptcha = () => {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      
      if (!siteKey) {
        setResult({ error: 'Site key not configured' })
        return
      }

      if (window.grecaptcha) {
        setRecaptchaReady(true)
        return
      }

      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
      script.onload = () => {
        window.grecaptcha.ready(() => {
          setRecaptchaReady(true)
        })
      }
      script.onerror = () => {
        setResult({ error: 'Failed to load reCAPTCHA script' })
      }
      document.head.appendChild(script)
    }

    loadRecaptcha()
  }, [])

  const testRecaptcha = async () => {
    setLoading(true)
    setResult(null)

    try {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      if (!siteKey) {
        setResult({ error: 'Site key not configured' })
        return
      }

      // Execute reCAPTCHA
      const token = await window.grecaptcha.execute(siteKey, {
        action: 'test_verification'
      })

      console.log('Generated token:', token?.substring(0, 20) + '...')

      // Test the token with our API
      const response = await fetch('/api/test-recaptcha-v3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()
      setResult(data)

    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Test failed' })
    } finally {
      setLoading(false)
    }
  }

  const testWithInvalidToken = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-recaptcha-v3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: 'invalid_token_test' }),
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
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            reCAPTCHA v3 Test Page
          </h1>
          
          <div className="space-y-4 mb-8">
            <div className={`p-4 rounded-md ${
              recaptchaReady 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`text-sm ${
                recaptchaReady ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {recaptchaReady 
                  ? '✅ reCAPTCHA v3 loaded and ready'
                  : '⏳ Loading reCAPTCHA v3...'
                }
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={testRecaptcha}
                disabled={loading || !recaptchaReady}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Testing...' : 'Test Valid reCAPTCHA'}
              </button>

              <button
                onClick={testWithInvalidToken}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Testing...' : 'Test Invalid Token'}
              </button>
            </div>
          </div>

          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Test Result:
              </h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
              
              {result.success && result.score !== undefined && (
                <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200">
                  <p className="text-blue-800 font-medium">
                    ✅ reCAPTCHA v3 is working! Score: {result.score}
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    Score interpretation: {result.score >= 0.7 ? 'Human-like' : result.score >= 0.3 ? 'Suspicious' : 'Bot-like'}
                  </p>
                </div>
              )}
              
              {result.success === false && (
                <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200">
                  <p className="text-red-800 font-medium">
                    ❌ reCAPTCHA verification failed
                  </p>
                  {result.errorCodes && (
                    <p className="text-red-600 text-sm mt-1">
                      Error codes: {result.errorCodes.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-sm text-gray-600">
            <h4 className="font-medium text-gray-800 mb-2">What this test shows:</h4>
            <ul className="space-y-1">
              <li>• Valid test should show success: true with a score (0.0-1.0)</li>
              <li>• Invalid test should show success: false with error codes</li>
              <li>• High scores (0.7+) indicate human-like behavior</li>
              <li>• Low scores (0.3-) indicate bot-like behavior</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}