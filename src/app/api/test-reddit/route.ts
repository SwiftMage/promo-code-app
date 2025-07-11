import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { redditUrl } = await request.json()
    
    if (!redditUrl) {
      return NextResponse.json({ error: 'Reddit URL required' }, { status: 400 })
    }
    
    // Clean the URL
    let cleanUrl = redditUrl.trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    
    const results: {
      originalUrl: string;
      cleanUrl: string;
      attempts: Array<{
        method: string;
        url: string;
        status: string | number;
        statusText?: string;
        success?: boolean;
        hasComments?: boolean;
        commentCount?: number;
        error?: string;
      }>;
    } = {
      originalUrl: redditUrl,
      cleanUrl: cleanUrl,
      attempts: []
    };
    
    // Try Method 1: Direct JSON
    try {
      const jsonUrl = cleanUrl.endsWith('.json') ? cleanUrl : `${cleanUrl}.json`;
      results.attempts.push({
        method: 'Direct JSON',
        url: jsonUrl,
        status: 'attempting'
      });
      
      const response = await fetch(jsonUrl);
      results.attempts[0].status = response.status;
      results.attempts[0].statusText = response.statusText;
      
      if (response.ok) {
        const data = await response.json();
        results.attempts[0].success = true;
        results.attempts[0].hasComments = !!(data[1]?.data?.children);
        results.attempts[0].commentCount = data[1]?.data?.children?.length || 0;
      } else {
        results.attempts[0].error = await response.text();
      }
    } catch (error) {
      results.attempts[0].error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    // Try Method 2: Old Reddit
    try {
      const oldRedditUrl = cleanUrl.replace('www.reddit.com', 'old.reddit.com');
      const oldJsonUrl = oldRedditUrl.endsWith('.json') ? oldRedditUrl : `${oldRedditUrl}.json`;
      results.attempts.push({
        method: 'Old Reddit JSON',
        url: oldJsonUrl,
        status: 'attempting'
      });
      
      const response = await fetch(oldJsonUrl);
      results.attempts[1].status = response.status;
      results.attempts[1].statusText = response.statusText;
      
      if (response.ok) {
        const data = await response.json();
        results.attempts[1].success = true;
        results.attempts[1].hasComments = !!(data[1]?.data?.children);
        results.attempts[1].commentCount = data[1]?.data?.children?.length || 0;
      } else {
        results.attempts[1].error = await response.text();
      }
    } catch (error) {
      results.attempts[1].error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    // Try Method 3: Using a CORS proxy (for debugging)
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl + '.json')}`;
      results.attempts.push({
        method: 'CORS Proxy',
        url: proxyUrl,
        status: 'attempting'
      });
      
      const response = await fetch(proxyUrl);
      results.attempts[2].status = response.status;
      results.attempts[2].statusText = response.statusText;
      
      if (response.ok) {
        const data = await response.json();
        results.attempts[2].success = true;
        results.attempts[2].hasComments = !!(data[1]?.data?.children);
        results.attempts[2].commentCount = data[1]?.data?.children?.length || 0;
      } else {
        results.attempts[2].error = await response.text();
      }
    } catch (error) {
      results.attempts[2].error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Test Reddit error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}