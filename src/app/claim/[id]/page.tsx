'use client'

import { useEffect, useState } from 'react'

interface ClaimPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ClaimPage({ params }: ClaimPageProps) {
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const claimCode = async () => {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/claim/${resolvedParams.id}`, {
          method: 'POST',
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setCode(data.code)
        } else {
          setError(data.error || 'Failed to claim code')
        }
      } catch {
        setError('Network error occurred')
      } finally {
        setLoading(false)
      }
    }

    claimCode()
  }, [params])

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

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Getting your promo code...</p>
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

          {/* Advertisement Space - Hidden until enabled */}
          {false && (
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-dashed border-gray-200">
              <div className="text-center text-gray-500 mb-4">
                <div className="text-2xl mb-2">📢</div>
                <h3 className="text-lg font-semibold mb-2">Advertisement Space</h3>
                <p className="text-sm">
                  This space is available for advertising your products or services
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">🏪</div>
                  <p className="text-lg font-medium">Your Ad Here</p>
                  <p className="text-sm">Perfect spot to promote complementary products</p>
                  <p className="text-xs mt-2">Premium placement • High visibility • Targeted audience</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}