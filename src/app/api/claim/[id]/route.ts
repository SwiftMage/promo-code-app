import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getClientIP } from '@/lib/utils'
import { fetchRedditPostContent } from '@/lib/reddit'
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
    // v2 doesn't have scores, just success/fail
    return result.success === true
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
    const { recaptchaToken, redditUsername, funnyWord } = body

    if (!recaptchaToken) {
      return NextResponse.json({ error: 'reCAPTCHA token is required' }, { status: 400 })
    }

    // Skip reCAPTCHA verification if it's already verified (for Reddit flow)
    if (recaptchaToken !== 'verified') {
      const isValidRecaptcha = await verifyRecaptcha(recaptchaToken)
      if (!isValidRecaptcha) {
        return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 })
      }
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

    // Check Reddit verification if required
    if (campaign.require_reddit_verification) {
      console.log('Reddit verification required for campaign:', campaignId);
      console.log('Reddit post URL:', campaign.reddit_post_url);
      console.log('Reddit username:', redditUsername);
      console.log('Funny word:', funnyWord);
      
      if (!redditUsername && !funnyWord) {
        return NextResponse.json({ error: 'Reddit username or funny word is required for this campaign' }, { status: 400 })
      }

      if (!campaign.reddit_post_url) {
        return NextResponse.json({ error: 'Campaign configuration error: Reddit post URL not set' }, { status: 500 })
      }

      try {
        console.log('Fetching Reddit post content from:', campaign.reddit_post_url);
        const { usernames, allCommentText } = await fetchRedditPostContent(campaign.reddit_post_url)
        
        if (redditUsername) {
          // Username verification
          if (!usernames.includes(redditUsername)) {
            return NextResponse.json({ 
              error: `Username "${redditUsername}" not found in the Reddit post. Please make sure you've commented in the specified post.` 
            }, { status: 400 })
          }
        } else if (funnyWord) {
          // Funny word verification
          if (!allCommentText.includes(funnyWord.toLowerCase())) {
            return NextResponse.json({ 
              error: `Secret word "${funnyWord}" not found in the Reddit post. Please make sure you've commented the word in the specified post.` 
            }, { status: 400 })
          }
        }
      } catch (error) {
        console.error('Reddit verification error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ 
          error: `Unable to verify Reddit post: ${errorMessage}. Please check the Reddit URL and try again.` 
        }, { status: 500 })
      }
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

    const updateData: any = {
      claimed_by: visitorId,
      claimed_at: new Date().toISOString(),
    }
    
    // Store Reddit username if provided
    if (redditUsername) {
      updateData.reddit_username = redditUsername
    }

    const { error: updateError } = await supabaseAdmin
      .from('promo_codes')
      .update(updateData)
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