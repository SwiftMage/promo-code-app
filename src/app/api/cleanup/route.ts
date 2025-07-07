import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    // Calculate the cutoff date (30 days ago)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoffDate = thirtyDaysAgo.toISOString()

    // Find campaigns older than 30 days
    const { data: expiredCampaigns, error: fetchError } = await supabaseAdmin
      .from('campaigns')
      .select('id')
      .lt('created_at', cutoffDate)

    if (fetchError) {
      console.error('Error fetching expired campaigns:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch expired campaigns' }, { status: 500 })
    }

    if (!expiredCampaigns || expiredCampaigns.length === 0) {
      return NextResponse.json({ 
        message: 'No expired campaigns to delete',
        deletedCampaigns: 0,
        deletedCodes: 0
      })
    }

    const campaignIds = expiredCampaigns.map(c => c.id)

    // Delete promo codes first (due to foreign key constraint)
    const { error: codesDeleteError } = await supabaseAdmin
      .from('promo_codes')
      .delete()
      .in('campaign_id', campaignIds)

    if (codesDeleteError) {
      console.error('Error deleting promo codes:', codesDeleteError)
      return NextResponse.json({ error: 'Failed to delete promo codes' }, { status: 500 })
    }

    // Delete campaigns
    const { error: campaignsDeleteError } = await supabaseAdmin
      .from('campaigns')
      .delete()
      .in('id', campaignIds)

    if (campaignsDeleteError) {
      console.error('Error deleting campaigns:', campaignsDeleteError)
      return NextResponse.json({ error: 'Failed to delete campaigns' }, { status: 500 })
    }

    // Count deleted promo codes
    const { count: deletedCodesCount } = await supabaseAdmin
      .from('promo_codes')
      .select('*', { count: 'exact', head: true })
      .in('campaign_id', campaignIds)

    return NextResponse.json({
      message: 'Cleanup completed successfully',
      deletedCampaigns: campaignIds.length,
      deletedCodes: deletedCodesCount || 0,
      cutoffDate
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Also allow GET for manual testing
export async function GET() {
  try {
    // Just show what would be deleted (dry run)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoffDate = thirtyDaysAgo.toISOString()

    const { data: expiredCampaigns, error } = await supabaseAdmin
      .from('campaigns')
      .select(`
        id, 
        created_at,
        promo_codes(count)
      `)
      .lt('created_at', cutoffDate)

    if (error) {
      console.error('Error checking expired campaigns:', error)
      return NextResponse.json({ error: 'Failed to check expired campaigns' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Dry run - campaigns that would be deleted',
      cutoffDate,
      expiredCampaigns: expiredCampaigns || [],
      count: expiredCampaigns?.length || 0
    })

  } catch (error) {
    console.error('Cleanup check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}