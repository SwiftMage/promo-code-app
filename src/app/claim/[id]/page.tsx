'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import AdSense from '@/components/AdSense'

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

interface ClaimPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ClaimPage({ params }: ClaimPageProps) {
  const searchParams = useSearchParams()
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [verified, setVerified] = useState(false)
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [requiresRedditVerification, setRequiresRedditVerification] = useState(false)
  const [redditUsername, setRedditUsername] = useState('')
  const [step, setStep] = useState<'recaptcha' | 'reddit' | 'complete'>('recaptcha')
  const [recaptchaReady, setRecaptchaReady] = useState(false)
  const [hasBypass, setHasBypass] = useState(false)

  useEffect(() => {
    // Check for bypass parameter
    const bypassToken = searchParams.get('bypass')
    if (bypassToken) {
      setHasBypass(true)
      // Skip reCAPTCHA loading for bypass links
    } else {
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
    }

    const getCampaignId = async () => {
      const resolvedParams = await params
      setCampaignId(resolvedParams.id)
      
      // Check if this campaign requires Reddit verification
      try {
        const response = await fetch(`/api/campaigns/${resolvedParams.id}/info`)
        if (response.ok) {
          const data = await response.json()
          setRequiresRedditVerification(data.requireRedditVerification)
        }
      } catch (error) {
        console.error('Failed to fetch campaign info:', error)
      }
    }
    getCampaignId()
  }, [params, searchParams])

  const handleRecaptchaVerification = async () => {
    if (!campaignId) return
    
    setLoading(true)
    setError(null)
    
    try {
      let recaptchaToken: string
      
      if (hasBypass) {
        // Use bypass token instead of reCAPTCHA
        recaptchaToken = 'bypass_' + searchParams.get('bypass')
      } else {
        // Check if reCAPTCHA is ready
        if (!recaptchaReady || !window.grecaptcha) {
          setError('reCAPTCHA is still loading, please try again in a moment')
          setLoading(false)
          return
        }

        // Execute reCAPTCHA v3
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
        if (!siteKey) {
          setError('reCAPTCHA configuration error')
          setLoading(false)
          return
        }

        recaptchaToken = await window.grecaptcha.execute(siteKey, {
          action: 'claim_code'
        })
        
        if (!recaptchaToken) {
          setError('reCAPTCHA verification failed')
          setLoading(false)
          return
        }
      }
      
      if (requiresRedditVerification && !hasBypass) {
        // Just move to Reddit verification step (unless we have bypass)
        setStep('reddit')
        setLoading(false)
        return
      }
      
      // Proceed with normal claim
      const response = await fetch(`/api/claim/${campaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recaptchaToken }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setCode(data.code)
        setVerified(true)
        setStep('complete')
      } else {
        setError(data.error || 'Failed to claim code')
      }
    } catch {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRedditVerification = async () => {
    if (!redditUsername.trim()) return
    if (!campaignId) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Check if reCAPTCHA is ready
      if (!recaptchaReady || !window.grecaptcha) {
        setError('reCAPTCHA is still loading, please try again in a moment')
        setLoading(false)
        return
      }

      // Execute reCAPTCHA v3 again for reddit verification
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      if (!siteKey) {
        setError('reCAPTCHA configuration error')
        setLoading(false)
        return
      }

      const recaptchaToken = await window.grecaptcha.execute(siteKey, {
        action: 'reddit_verification'
      })
      
      if (!recaptchaToken) {
        setError('reCAPTCHA verification failed')
        setLoading(false)
        return
      }
      
      const response = await fetch(`/api/claim/${campaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          recaptchaToken,
          redditUsername: redditUsername.trim()
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setCode(data.code)
        setVerified(true)
        setStep('complete')
      } else {
        setError(data.error || 'Reddit verification failed')
      }
    } catch {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }


  const copyToClipboard = async () => {
    if (!code) return
    
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  if (step === 'recaptcha' && !error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-6">{hasBypass ? '🎟️' : '🔐'}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {hasBypass ? 'Direct Access Code' : 'Verify You\'re Human'}
          </h1>
          <p className="text-gray-600 mb-8">
            {hasBypass 
              ? 'You have a direct access link. Click below to claim your code.'
              : 'Click the button below to verify and claim your promo code'}
          </p>
          <div className="inline-block">
            <button
              onClick={handleRecaptchaVerification}
              disabled={loading || (!hasBypass && !recaptchaReady)}
              className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Verifying...' : hasBypass ? 'Claim Code' : recaptchaReady ? 'Verify & Claim Code' : 'Loading...'}
            </button>
          </div>
          {loading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Verifying...</p>
            </div>
          )}
        </div>
      </main>
    )
  }

  if (step === 'reddit' && !error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-lg mx-auto text-center bg-white rounded-lg shadow-lg p-8">
          <div className="text-5xl mb-6">👤</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Reddit Verification Required
          </h1>
          <p className="text-gray-600 mb-6">
            You must comment in the specified Reddit post to claim a code.
          </p>
          
          <div className="mb-6">
            <label htmlFor="redditUsername" className="block text-sm font-medium text-gray-700 mb-2">
              Reddit Username
            </label>
            <input
              type="text"
              id="redditUsername"
              value={redditUsername}
              onChange={(e) => setRedditUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
              placeholder="your_reddit_username"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter your username without the u/ prefix
            </p>
          </div>

          <button
            onClick={handleRedditVerification}
            disabled={loading || !redditUsername.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Verifying...' : 'Verify & Claim Code'}
          </button>
          {loading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Checking Reddit post...</p>
            </div>
          )}
        </div>
      </main>
    )
  }

  if (step === 'complete' && verified && code) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Congratulations!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Here&apos;s your exclusive promo code:
            </p>
            
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 mb-6">
                <div className="text-3xl font-bold mb-2">{code}</div>
                <p className="text-purple-100">Your exclusive promo code</p>
              </div>
              
              <button
                onClick={copyToClipboard}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium mb-4"
              >
                {copied ? 'Copied to Clipboard!' : 'Copy Code'}
              </button>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>• This code is exclusively yours</p>
                <p>• Use it at checkout to get your discount</p>
                <p>• Save this page or copy the code now</p>
                {requiresRedditVerification && (
                  <p>• ✅ Reddit verification completed</p>
                )}
              </div>
            </div>

            <AdSense />
          </div>
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
              Sorry!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {error}
            </p>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                What happened?
              </h2>
              <ul className="text-gray-600 space-y-2 text-left">
                <li>• All promo codes may have been claimed</li>
                <li>• The campaign may have expired</li>
                <li>• You may have already received a code</li>
                <li>• The campaign link may be invalid</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return null
}