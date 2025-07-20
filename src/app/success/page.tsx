'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const claimUrl = searchParams.get('claimUrl')
  const manageUrl = searchParams.get('manageUrl')
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Campaign Created Successfully!
            </h1>
            <p className="text-xl text-gray-600">
              Your promo code distribution campaign is now live. Share the claim link with your audience.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                🔗 Public Claim Link
              </h2>
              <p className="text-gray-600 mb-3">
                Share this link with your audience. Each visitor will receive one unique promo code.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={claimUrl || ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(claimUrl || '', 'claim')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  {copied === 'claim' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                📊 Management Link
              </h2>
              <p className="text-gray-600 mb-3">
                Use this private link to view statistics, manage codes, and track usage. Keep it secure!
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manageUrl || ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(manageUrl || '', 'manage')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  {copied === 'manage' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <a
                href={claimUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 font-medium"
              >
                View Claim Page
              </a>
              <a
                href={manageUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 font-medium"
              >
                View Management Page
              </a>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Important Notes:</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Each visitor gets only one code based on their device/IP fingerprint</li>
                <li>• Keep your management link private and secure</li>
                <li>• Codes are distributed on a first-come, first-served basis</li>
                <li>• Use the management link to track usage and export data</li>
                <li>• <strong>Note:</strong> The fingerprinting system is not foolproof - determined users may obtain multiple codes using different devices or networks</li>
                <li>• <strong>Expiration:</strong> This campaign and all data will be automatically deleted after 30 days</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Create Another Campaign
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}