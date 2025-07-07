import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getClientIP } from '@/lib/utils'
import { createHash } from 'crypto'

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