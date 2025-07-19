import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params
    const managementSlug = params.slug

    // Verify the management slug exists
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id')
      .eq('management_slug', managementSlug)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Invalid management link' }, { status: 404 })
    }

    // Get an available code
    const { data: availableCode, error: codeError } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('campaign_id', campaign.id)
      .is('claimed_by', null)
      .limit(1)
      .single()

    if (codeError || !availableCode) {
      return NextResponse.json({ error: 'No available codes' }, { status: 404 })
    }

    // Mark the code as claimed by admin
    const { error: updateError } = await supabaseAdmin
      .from('promo_codes')
      .update({
        claimed_by: 'ADMIN_CLAIM',
        claimed_at: new Date().toISOString(),
        reddit_username: 'admin'
      })
      .eq('id', availableCode.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to claim code' }, { status: 500 })
    }

    return NextResponse.json({ 
      code: availableCode.value,
      message: 'Code claimed successfully by admin'
    })

  } catch (error) {
    console.error('Admin claim error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}