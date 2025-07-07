import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    siteKeyExists: !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    secretKeyExists: !!process.env.RECAPTCHA_SECRET_KEY,
    siteKeyPrefix: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.substring(0, 15) + '...',
    secretKeyPrefix: process.env.RECAPTCHA_SECRET_KEY?.substring(0, 15) + '...',
  })
}