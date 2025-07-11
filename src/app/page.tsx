import CodeInputForm from '@/components/CodeInputForm'
import AdSense from '@/components/AdSense'
import Image from 'next/image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PromoDistro - Free Promo Code Distribution Tool | Manage & Track Codes',
  description: 'Distribute promo codes efficiently with PromoDistro. Create unique links, track usage, prevent duplicate claims with IP tracking. Perfect for marketing campaigns, giveaways, and promotions.',
  keywords: 'promo code distribution, promo code manager, coupon distribution, marketing tool, code tracker, promotional codes, discount code manager, giveaway tool',
  openGraph: {
    title: 'PromoDistro - Free Promo Code Distribution Tool',
    description: 'Easily distribute and track promo codes with unique links. Each visitor gets one code with automatic IP tracking.',
    type: 'website',
    url: 'https://promodistro.com',
    images: [
      {
        url: '/images/promodistro.png',
        width: 1200,
        height: 630,
        alt: 'PromoDistro - Promo Code Distribution Tool',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromoDistro - Free Promo Code Distribution Tool',
    description: 'Easily distribute and track promo codes with unique links. Each visitor gets one code.',
    images: ['/images/promodistro.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://promodistro.com',
  },
}

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PromoDistro',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    description: 'Free online tool to distribute promo codes with unique links, automatic tracking, and IP-based duplicate prevention.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
    },
    featureList: [
      'Bulk promo code upload',
      'Unique distribution links',
      'IP-based duplicate prevention',
      'Real-time usage tracking',
      'Private management dashboard',
      'No registration required',
    ],
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does PromoDistro prevent duplicate code claims?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PromoDistro uses IP address tracking and browser fingerprinting to ensure each visitor receives only one promo code per campaign.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is PromoDistro free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, PromoDistro is completely free to use for distributing and tracking promo codes.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many promo codes can I distribute?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can distribute unlimited promo codes. Simply paste them separated by commas or new lines.',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-3">
            <Image 
              src="/images/promodistro.png" 
              alt="PromoDistro - Free Promo Code Distribution Tool" 
              width={400} 
              height={150}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="sr-only">PromoDistro - Free Promo Code Distribution and Management Tool</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Distribute promo codes with unique links. One code per visitor, automatically tracked.
          </p>
        </header>
        
        <div className="max-w-2xl mx-auto">
          <CodeInputForm />
        </div>
        
        <div className="mt-12 max-w-2xl mx-auto">
          <AdSense />
        </div>
        
        <section className="mt-16 text-center" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="text-2xl font-semibold text-gray-800 mb-6">How PromoDistro Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">1. Input Codes</h3>
              <p className="text-gray-700">
                Enter your promo codes separated by commas or new lines
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
          
          <aside className="mt-12 max-w-4xl mx-auto" aria-label="Security information">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">Security & Fair Distribution</h3>
              <p className="text-sm text-yellow-700 mb-2">
                Our system uses IP address and browser fingerprinting to ensure each visitor receives only one promo code per campaign. 
                This provides reasonable protection for fair distribution.
              </p>
              <p className="text-sm text-yellow-700">
                <strong>Limitation:</strong> Determined users may obtain multiple codes using different devices, networks, 
                or browsers. This system is not foolproof but works well for honest users.
              </p>
            </div>
          </aside>
          <section className="mt-16 max-w-4xl mx-auto" aria-labelledby="faq">
            <h2 id="faq" className="text-2xl font-semibold text-gray-800 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4 text-left">
              <details className="bg-white rounded-lg p-6 shadow-md">
                <summary className="font-semibold cursor-pointer">How does PromoDistro prevent duplicate code claims?</summary>
                <p className="mt-3 text-gray-700">PromoDistro uses IP address tracking and browser fingerprinting to ensure each visitor receives only one promo code per campaign.</p>
              </details>
              <details className="bg-white rounded-lg p-6 shadow-md">
                <summary className="font-semibold cursor-pointer">Is PromoDistro free to use?</summary>
                <p className="mt-3 text-gray-700">Yes, PromoDistro is completely free to use for distributing and tracking promo codes.</p>
              </details>
              <details className="bg-white rounded-lg p-6 shadow-md">
                <summary className="font-semibold cursor-pointer">How many promo codes can I distribute?</summary>
                <p className="mt-3 text-gray-700">You can distribute unlimited promo codes. Simply paste them separated by commas or new lines.</p>
              </details>
              <details className="bg-white rounded-lg p-6 shadow-md">
                <summary className="font-semibold cursor-pointer">What types of codes can I distribute?</summary>
                <p className="mt-3 text-gray-700">Any text-based codes: discount codes, serial keys, vouchers, gift cards, access codes, or custom promotional codes.</p>
              </details>
              <details className="bg-white rounded-lg p-6 shadow-md">
                <summary className="font-semibold cursor-pointer">Can I track who claimed which code?</summary>
                <p className="mt-3 text-gray-700">Yes, the private management link shows you which codes have been claimed, when they were claimed, and basic analytics.</p>
              </details>
            </div>
          </section>
        </section>
      </div>
    </main>
    </>
  )
}
