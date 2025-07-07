import AdSense from '@/components/AdSense'

export default function AdSenseTestPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AdSense Test Page
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            This page demonstrates our AdSense integration for Google verification
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 mb-6">
              <div className="text-3xl font-bold mb-2">TEST123</div>
              <p className="text-purple-100">Sample promo code display</p>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>• This is how promo codes are displayed to users</p>
              <p>• Each visitor gets a unique code on their claim page</p>
              <p>• AdSense ads appear below the code</p>
            </div>
          </div>

          <AdSense />
        </div>
      </div>
    </main>
  )
}