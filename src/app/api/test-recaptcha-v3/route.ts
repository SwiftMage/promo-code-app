import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    
    if (!secretKey) {
      return NextResponse.json({ 
        error: 'reCAPTCHA secret key not configured'
      }, { status: 500 })
    }

    console.log('Testing reCAPTCHA v3 verification...')
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const recaptchaData = await recaptchaResponse.json()
    console.log('reCAPTCHA test result:', recaptchaData)
    
    return NextResponse.json({
      success: recaptchaData.success,
      score: recaptchaData.score,
      action: recaptchaData.action,
      errorCodes: recaptchaData['error-codes'],
      hostname: recaptchaData.hostname,
      challengeTs: recaptchaData.challenge_ts
    })

  } catch (error) {
    console.error('reCAPTCHA test error:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}