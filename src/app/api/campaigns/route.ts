import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateCampaignId, generateAdminKey, parseCodesInput, deduplicateCodes } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { codes, recaptchaToken, requireRedditVerification, redditPostUrl } = await request.json()
    
    if (!codes || typeof codes !== 'string') {
      return NextResponse.json({ error: 'Codes are required' }, { status: 400 })
    }

    if (!recaptchaToken) {
      return NextResponse.json({ error: 'reCAPTCHA verification required' }, { status: 400 })
    }

    if (requireRedditVerification && (!redditPostUrl || !redditPostUrl.includes('reddit.com'))) {
      return NextResponse.json({ error: 'Valid Reddit post URL required for verification' }, { status: 400 })
    }

    // Verify reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    
    if (!secretKey) {
      return NextResponse.json({ 
        error: 'Server configuration error',
        details: 'reCAPTCHA secret key not configured'
      }, { status: 500 })
    }

    console.log('Verifying reCAPTCHA token with Google...')
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${recaptchaToken}`,
    })

    const recaptchaData = await recaptchaResponse.json()
    console.log('reCAPTCHA verification result:', recaptchaData)
    
    if (!recaptchaData.success) {
      console.error('reCAPTCHA verification failed:', recaptchaData)
      return NextResponse.json({ 
        error: 'reCAPTCHA verification failed',
        details: recaptchaData['error-codes'] ? `Error codes: ${recaptchaData['error-codes'].join(', ')}` : 'Please try again'
      }, { status: 400 })
    }

    // Log the reCAPTCHA score for v3 (should be between 0.0 and 1.0)
    if (recaptchaData.score !== undefined) {
      console.log(`reCAPTCHA v3 score: ${recaptchaData.score} (action: ${recaptchaData.action})`)
    }

    const parsedCodes = parseCodesInput(codes)
    const deduplicatedCodes = deduplicateCodes(parsedCodes)
    
    if (deduplicatedCodes.length === 0) {
      return NextResponse.json({ error: 'No valid codes provided' }, { status: 400 })
    }

    if (deduplicatedCodes.length > 10000) {
      return NextResponse.json({ error: 'Too many codes (max 10,000)' }, { status: 400 })
    }

    const campaignId = generateCampaignId()
    const adminKey = generateAdminKey()
    
    // Set expiration date to 30 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .insert({
        id: campaignId,
        admin_key: adminKey,
        expires_at: expiresAt.toISOString(),
        require_reddit_verification: requireRedditVerification || false,
        reddit_post_url: redditPostUrl || null,
      })
      .select()

    if (campaignError) {
      console.error('Campaign creation error:', campaignError)
      return NextResponse.json({ 
        error: 'Failed to create campaign', 
        details: campaignError.message,
        hint: campaignError.hint || 'Check if the campaigns table exists in Supabase'
      }, { status: 500 })
    }

    const promoCodeInserts = deduplicatedCodes.map(code => ({
      campaign_id: campaignId,
      value: code,
    }))

    const { error: codesError } = await supabaseAdmin
      .from('promo_codes')
      .insert(promoCodeInserts)
      .select()

    if (codesError) {
      console.error('Promo codes creation error:', codesError)
      await supabaseAdmin.from('campaigns').delete().eq('id', campaignId)
      return NextResponse.json({ 
        error: 'Failed to create promo codes', 
        details: codesError.message,
        hint: codesError.hint || 'Check if the promo_codes table exists in Supabase'
      }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.NEXT_PUBLIC_VERCEL_URL 
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000')

    const claimUrl = `${baseUrl}/claim/${campaignId}`
    const manageUrl = `${baseUrl}/manage/${campaignId}-${adminKey}`

    return NextResponse.json({
      campaignId,
      claimUrl,
      manageUrl,
      totalCodes: deduplicatedCodes.length,
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}