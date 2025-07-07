import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Test if we can connect to Supabase and check tables
    const { data: campaigns, error: campaignsError } = await supabaseAdmin
      .from('campaigns')
      .select('count(*)')
      .limit(1)

    const { data: promoCodes, error: promoCodesError } = await supabaseAdmin
      .from('promo_codes')
      .select('count(*)')
      .limit(1)

    return NextResponse.json({
      success: true,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
      tables: {
        campaigns: campaignsError ? `Error: ${campaignsError.message}` : 'OK',
        promo_codes: promoCodesError ? `Error: ${promoCodesError.message}` : 'OK'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}