import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params
    const slug = params.slug
    
    const parts = slug.split('-')
    if (parts.length < 2) {
      return NextResponse.json({ error: 'Invalid management link' }, { status: 400 })
    }
    
    const campaignId = parts[0]
    const adminKey = parts.slice(1).join('-')

    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('admin_key', adminKey)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found or access denied' }, { status: 404 })
    }

    const { data: codes, error: codesError } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('value', { ascending: true })

    if (codesError) {
      console.error('Codes fetch error:', codesError)
      return NextResponse.json({ error: 'Failed to fetch codes' }, { status: 500 })
    }

    const totalCodes = codes.length
    const claimedCodes = codes.filter(code => code.claimed_by).length

    const stats = {
      campaignId: campaign.id,
      totalCodes,
      claimedCodes,
      createdAt: campaign.created_at,
      expiresAt: campaign.expires_at,
    }

    return NextResponse.json({
      stats,
      codes: codes.map(code => ({
        id: code.id,
        value: code.value,
        claimedBy: code.claimed_by,
        claimedAt: code.claimed_at,
        redditUsername: code.reddit_username,
      })),
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}