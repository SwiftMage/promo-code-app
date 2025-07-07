import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminToken = request.cookies.get('admin-token')?.value
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all campaigns
    const { data: campaigns, error: fetchError } = await supabaseAdmin
      .from('campaigns')
      .select('*')

    if (fetchError) {
      console.error('Failed to fetch campaigns:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    let fixedCount = 0

    for (const campaign of campaigns || []) {
      const expirationDate = new Date(campaign.expires_at)
      const creationDate = new Date(campaign.created_at)
      
      // If expiration date is invalid (1969) or in the past relative to creation
      if (expirationDate.getFullYear() < 2020 || expirationDate < creationDate) {
        // Set to 30 days from creation date
        const newExpirationDate = new Date(creationDate)
        newExpirationDate.setDate(newExpirationDate.getDate() + 30)

        const { error: updateError } = await supabaseAdmin
          .from('campaigns')
          .update({ expires_at: newExpirationDate.toISOString() })
          .eq('id', campaign.id)

        if (updateError) {
          console.error(`Failed to update campaign ${campaign.id}:`, updateError)
        } else {
          fixedCount++
        }
      }
    }

    return NextResponse.json({ 
      message: `Fixed ${fixedCount} campaigns with invalid expiration dates`,
      totalCampaigns: campaigns?.length || 0,
      fixedCount 
    })
  } catch (error) {
    console.error('Fix dates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}