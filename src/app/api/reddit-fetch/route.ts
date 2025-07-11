import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url || !url.includes('reddit.com')) {
      return NextResponse.json({ 
        error: 'Invalid Reddit URL' 
      }, { status: 400 })
    }

    // Clean the URL and append .json
    let jsonUrl = url.trim()
    if (jsonUrl.endsWith('/')) {
      jsonUrl = jsonUrl.slice(0, -1)
    }
    jsonUrl = jsonUrl + '.json'

    console.log('Server-side Reddit fetch:', jsonUrl)

    // Fetch directly from Reddit (no CORS issues on server)
    const response = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
    })

    if (!response.ok) {
      throw new Error(`Reddit returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Extract usernames from Reddit JSON
    const usernames: string[] = []
    const commentTexts: string[] = []
    
    if (Array.isArray(data) && data[1]?.data?.children) {
      const comments = data[1].data.children
      
      function extractFromComment(comment: Record<string, unknown>) {
        const data = comment.data as Record<string, unknown>
        if (data?.author && typeof data.author === 'string' && data.author !== '[deleted]' && data.author !== 'AutoModerator') {
          usernames.push(data.author)
          if (data.body && typeof data.body === 'string') {
            commentTexts.push(data.body)
          }
        }
        // Recursively check replies
        const replies = data?.replies as Record<string, unknown>
        const repliesData = replies?.data as Record<string, unknown>
        if (repliesData?.children && Array.isArray(repliesData.children)) {
          repliesData.children.forEach(extractFromComment)
        }
      }
      
      comments.forEach(extractFromComment)
    }

    console.log('Server extracted usernames:', usernames.length)

    return NextResponse.json({
      success: true,
      usernames: [...new Set(usernames)],
      allCommentText: commentTexts.join(' ').toLowerCase()
    })

  } catch (error) {
    console.error('Server-side Reddit fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch Reddit data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}