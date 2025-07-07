import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateCampaignId, generateAdminKey, parseCodesInput, deduplicateCodes } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { codes } = await request.json()
    
    if (!codes || typeof codes !== 'string') {
      return NextResponse.json({ error: 'Codes are required' }, { status: 400 })
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

    const { error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        id: campaignId,
        admin_key: adminKey,
      })

    if (campaignError) {
      console.error('Campaign creation error:', campaignError)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    const promoCodeInserts = deduplicatedCodes.map(code => ({
      campaign_id: campaignId,
      value: code,
    }))

    const { error: codesError } = await supabase
      .from('promo_codes')
      .insert(promoCodeInserts)

    if (codesError) {
      console.error('Promo codes creation error:', codesError)
      await supabase.from('campaigns').delete().eq('id', campaignId)
      return NextResponse.json({ error: 'Failed to create promo codes' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000'

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