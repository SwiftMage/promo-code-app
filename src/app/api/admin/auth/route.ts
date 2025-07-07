import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Hash the password for secure storage
const ADMIN_EMAIL = 'evangjones@gmail.com'
const ADMIN_PASSWORD_HASH = crypto.createHash('sha256').update('koqhiz-5cepZe-hoxkic').digest('hex')

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
    
    if (email === ADMIN_EMAIL && passwordHash === ADMIN_PASSWORD_HASH) {
      // Create a simple session token
      const token = crypto.randomBytes(32).toString('hex')
      
      const response = NextResponse.json({ success: true, token })
      
      // Set secure cookie
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
      })
      
      return response
    }
    
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}