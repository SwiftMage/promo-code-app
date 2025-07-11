'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

export default function CodeInputForm() {
  const [codes, setCodes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [requireRedditVerification, setRequireRedditVerification] = useState(false)
  const [redditPostUrl, setRedditPostUrl] = useState('')
  const [recaptchaReady, setRecaptchaReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load reCAPTCHA v3 script
    const loadRecaptcha = () => {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      console.log('reCAPTCHA Site Key:', siteKey ? 'Present' : 'Missing')
      
      if (!siteKey) {
        console.error('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set')
        setError('reCAPTCHA configuration missing')
        return
      }

      if (window.grecaptcha) {
        console.log('reCAPTCHA already loaded')
        setRecaptchaReady(true)
        return
      }

      console.log('Loading reCAPTCHA script...')
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
      script.onload = () => {
        console.log('reCAPTCHA script loaded')
        window.grecaptcha.ready(() => {
          console.log('reCAPTCHA ready')
          setRecaptchaReady(true)
        })
      }
      script.onerror = () => {
        console.error('Failed to load reCAPTCHA script')
        setError('Failed to load reCAPTCHA')
      }
      document.head.appendChild(script)
    }

    loadRecaptcha()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (requireRedditVerification && !redditPostUrl.trim()) {
      setError('Please provide a Reddit post URL for verification')
      setLoading(false)
      return
    }

    try {
      // Try reCAPTCHA v3 if available, otherwise proceed without it
      let recaptchaToken = 'fallback_token'
      
      if (recaptchaReady && window.grecaptcha) {
        try {
          const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
          console.log('Executing reCAPTCHA with site key:', siteKey)
          if (siteKey) {
            recaptchaToken = await window.grecaptcha.execute(siteKey, {
              action: 'create_campaign'
            })
            console.log('reCAPTCHA token generated:', recaptchaToken?.substring(0, 20) + '...')
          }
        } catch (err) {
          console.error('reCAPTCHA execution failed:', err)
          console.warn('Proceeding without reCAPTCHA verification')
        }
      } else {
        console.warn('reCAPTCHA not ready, using fallback token')
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          codes, 
          recaptchaToken,
          requireRedditVerification,
          redditPostUrl: requireRedditVerification ? redditPostUrl.trim() : null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to create campaign')
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
            placeholder="Enter your promo codes here, separated by commas or new lines:

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

        <div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="requireRedditVerification"
              checked={requireRedditVerification}
              onChange={(e) => setRequireRedditVerification(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="requireRedditVerification" className="text-sm font-medium text-gray-700">
              Require Reddit post verification
            </label>
          </div>
          
          {requireRedditVerification && (
            <div className="mb-6">
              <label htmlFor="redditPostUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Reddit Post URL
              </label>
              <input
                type="url"
                id="redditPostUrl"
                value={redditPostUrl}
                onChange={(e) => setRedditPostUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
                placeholder="https://www.reddit.com/r/example/comments/xyz/post_title/"
                required={requireRedditVerification}
              />
              <p className="mt-2 text-sm text-gray-500">
                Users will need to comment in this Reddit post with their username to claim a code
              </p>
            </div>
          )}
        </div>

        <div>
          <div className={`border rounded-md p-4 ${
            error?.includes('reCAPTCHA') 
              ? 'bg-orange-50 border-orange-200' 
              : recaptchaReady 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`text-sm ${
              error?.includes('reCAPTCHA') 
                ? 'text-orange-800' 
                : recaptchaReady 
                  ? 'text-blue-800' 
                  : 'text-yellow-800'
            }`}>
              {error?.includes('reCAPTCHA')
                ? '⚠️ reCAPTCHA temporarily unavailable - form will work without it'
                : recaptchaReady 
                  ? '🔒 This form is protected by reCAPTCHA v3 and will verify automatically when you submit.'
                  : '⏳ Loading reCAPTCHA verification...'
              }
            </p>
          </div>
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