import CodeInputForm from '@/components/CodeInputForm'
import AdSense from '@/components/AdSense'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image 
              src="/images/promodistro.png" 
              alt="PromoDistro" 
              width={400} 
              height={150}
              className="object-contain"
              priority
            />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Distribute promo codes to your audience with unique links. Each visitor gets one code, automatically tracked and managed.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <CodeInputForm />
        </div>
        
        <div className="mt-12 max-w-2xl mx-auto">
          <AdSense />
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">1. Input Codes</h3>
              <p className="text-gray-700">
                Enter your promo codes separated by commas, spaces, or new lines
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">2. Get Links</h3>
              <p className="text-gray-700">
                Receive a public claim link and private management link
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">3. Track Usage</h3>
              <p className="text-gray-700">
                Monitor which codes are claimed and by whom
              </p>
            </div>
          </div>
          
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">Important Notice</h3>
              <p className="text-sm text-yellow-700 mb-2">
                Our system uses IP address and browser fingerprinting to ensure each visitor receives only one promo code per campaign. 
                This provides reasonable protection for fair distribution.
              </p>
              <p className="text-sm text-yellow-700">
                <strong>Limitation:</strong> Determined users may obtain multiple codes using different devices, networks, 
                or browsers. This system is not foolproof but works well for honest users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
