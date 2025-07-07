import CodeInputForm from '@/components/CodeInputForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Promo Code Distribution
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Distribute promo codes to your audience with unique links. Each visitor gets one code, automatically tracked and managed.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <CodeInputForm />
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">1. Input Codes</h3>
              <p className="text-gray-600">
                Enter your promo codes separated by commas, spaces, or new lines
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold mb-2">2. Get Links</h3>
              <p className="text-gray-600">
                Receive a public claim link and private management link
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">3. Track Usage</h3>
              <p className="text-gray-600">
                Monitor which codes are claimed and by whom
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
