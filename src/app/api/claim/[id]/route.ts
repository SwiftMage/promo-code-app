import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getClientIP } from '@/lib/utils'
import { createHash } from 'crypto'

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  
  if (!secretKey) {
    console.error('reCAPTCHA secret key not configured')
    return false
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const result = await response.json()
    return result.success && result.score >= 0.7
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return false
  }
}

function generateVisitorId(ip: string, userAgent: string): string {
  const combined = `${ip}:${userAgent}`
  return createHash('sha256').update(combined).digest('hex')
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const campaignId = params.id
    const body = await request.json()
    const { recaptchaToken } = body

    if (!recaptchaToken) {
      return NextResponse.json({ error: 'reCAPTCHA token is required' }, { status: 400 })
    }

    const isValidRecaptcha = await verifyRecaptcha(recaptchaToken)
    if (!isValidRecaptcha) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 })
    }

    const ip = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''
    const visitorId = generateVisitorId(ip, userAgent)

    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.expires_at && new Date(campaign.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Campaign has expired' }, { status: 410 })
    }

    const { data: existingCode } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('claimed_by', visitorId)
      .single()

    if (existingCode) {
      return NextResponse.json({ code: existingCode.value })
    }

    const { data: availableCode, error: availableError } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('campaign_id', campaignId)
      .is('claimed_by', null)
      .limit(1)
      .single()

    if (availableError || !availableCode) {
      return NextResponse.json({ error: 'All promo codes have been claimed' }, { status: 410 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('promo_codes')
      .update({
        claimed_by: visitorId,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', availableCode.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to claim code' }, { status: 500 })
    }

    return NextResponse.json({ code: availableCode.value })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}