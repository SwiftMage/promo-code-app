import { NextRequest, NextResponse } from 'next/server'
import { fetchRedditPostContent } from '@/lib/reddit'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('Testing Reddit fetch for:', url)
    const result = await fetchRedditPostContent(url)
    
    return NextResponse.json({
      success: true,
      usernamesFound: result.usernames.length,
      usernames: result.usernames.slice(0, 20), // First 20 usernames
      hasTargetUser: result.usernames.includes('BETO123USA'),
      commentTextLength: result.allCommentText.length,
      sampleCommentText: result.allCommentText.substring(0, 200)
    })

  } catch (error) {
    console.error('Reddit fetch test error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Test failed',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}