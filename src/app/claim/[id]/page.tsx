'use client'

import { useEffect, useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import AdSense from '@/components/AdSense'

interface ClaimPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ClaimPage({ params }: ClaimPageProps) {
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [verified, setVerified] = useState(false)
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  useEffect(() => {
    const getCampaignId = async () => {
      const resolvedParams = await params
      setCampaignId(resolvedParams.id)
    }
    getCampaignId()
  }, [params])

  const handleRecaptchaChange = async (token: string | null) => {
    if (!token || !campaignId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/claim/${campaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recaptchaToken: token }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setCode(data.code)
        setVerified(true)
      } else {
        setError(data.error || 'Failed to claim code')
        recaptchaRef.current?.reset()
      }
    } catch {
      setError('Network error occurred')
      recaptchaRef.current?.reset()
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

  if (!verified && !error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-6">🔐</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Verify You&apos;re Human
          </h1>
          <p className="text-gray-600 mb-8">
            Please complete the verification below to claim your promo code
          </p>
          <div className="inline-block">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              onChange={handleRecaptchaChange}
              theme="light"
            />
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
            </div>
          </div>

          <AdSense />
        </div>
      </div>
    </main>
  )
}