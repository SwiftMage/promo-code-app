import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const adminToken = request.cookies.get('admin-token')?.value

  if (!adminToken) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  // For now, we'll just check if the token exists and is non-empty
  // In a production app, you'd validate against a database or JWT
  if (adminToken.length > 0) {
    return NextResponse.json({ valid: true })
  }

  return NextResponse.json({ valid: false }, { status: 401 })
}