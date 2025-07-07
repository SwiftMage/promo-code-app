import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminToken = request.cookies.get('admin-token')?.value
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total campaigns
    const { data: campaigns, error: campaignsError } = await supabaseAdmin
      .from('campaigns')
      .select('*')

    if (campaignsError) {
      console.error('Campaigns query error:', campaignsError)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    // Get active campaigns (not expired)
    const activeCampaigns = campaigns?.filter(campaign => 
      new Date(campaign.expires_at) > new Date()
    ) || []

    // Get total promo codes
    const { data: promoCodes, error: promoCodesError } = await supabaseAdmin
      .from('promo_codes')
      .select('*')

    if (promoCodesError) {
      console.error('Promo codes query error:', promoCodesError)
      return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 })
    }

    // Get claimed codes
    const claimedCodes = promoCodes?.filter(code => code.claimed_at) || []

    // Get unique visitors (based on visitor_id)
    const uniqueVisitors = new Set(
      claimedCodes.map(code => code.visitor_id).filter(Boolean)
    )

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentCampaigns = campaigns?.filter(campaign => 
      new Date(campaign.created_at) > thirtyDaysAgo
    ) || []

    const recentClaims = claimedCodes.filter(code => 
      code.claimed_at && new Date(code.claimed_at) > thirtyDaysAgo
    )

    // Calculate daily activity for last 7 days
    const dailyActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))

      const dayClaims = claimedCodes.filter(code => 
        code.claimed_at && 
        new Date(code.claimed_at) >= dayStart && 
        new Date(code.claimed_at) <= dayEnd
      )

      dailyActivity.push({
        date: dayStart.toISOString().split('T')[0],
        claims: dayClaims.length
      })
    }

    // Top campaigns by usage
    const campaignUsage = campaigns?.map(campaign => {
      const campaignCodes = promoCodes?.filter(code => code.campaign_id === campaign.id) || []
      const claimedCount = campaignCodes.filter(code => code.claimed_at).length
      
      return {
        id: campaign.id,
        totalCodes: campaignCodes.length,
        claimedCodes: claimedCount,
        percentageClaimed: campaignCodes.length > 0 ? Math.round((claimedCount / campaignCodes.length) * 100) : 0,
        createdAt: campaign.created_at,
        expiresAt: campaign.expires_at
      }
    }).sort((a, b) => b.claimedCodes - a.claimedCodes) || []

    const stats = {
      totalCampaigns: campaigns?.length || 0,
      activeCampaigns: activeCampaigns.length,
      totalPromoCodes: promoCodes?.length || 0,
      claimedCodes: claimedCodes.length,
      uniqueVisitors: uniqueVisitors.size,
      recentCampaigns: recentCampaigns.length,
      recentClaims: recentClaims.length,
      dailyActivity,
      topCampaigns: campaignUsage.slice(0, 10),
      claimRate: promoCodes?.length ? Math.round((claimedCodes.length / promoCodes.length) * 100) : 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}