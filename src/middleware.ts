import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return false
  }
  
  if (now - record.timestamp > windowMs) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return false
  }
  
  if (record.count >= limit) {
    return true
  }
  
  record.count++
  return false
}

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1'
  
  const pathname = request.nextUrl.pathname
  
  // Note: /test routes are protected client-side in the component
  // Middleware protection removed to avoid redirect loops
  
  if (pathname.startsWith('/api/')) {
    const isLimited = rateLimit(ip, 100, 60000)
    
    if (isLimited) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
  }
  
  if (pathname.startsWith('/api/campaigns')) {
    const isLimited = rateLimit(`${ip}:campaigns`, 10, 60000)
    
    if (isLimited) {
      return NextResponse.json(
        { error: 'Too many campaign creation requests' },
        { status: 429 }
      )
    }
  }
  
  if (pathname.startsWith('/api/claim/')) {
    const isLimited = rateLimit(`${ip}:claim`, 20, 60000)
    
    if (isLimited) {
      return NextResponse.json(
        { error: 'Too many claim requests' },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
}