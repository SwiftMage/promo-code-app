import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { createHash } from 'crypto'

export async function getVisitorId(ip: string): Promise<string> {
  // Get browser fingerprint
  const fp = await FingerprintJS.load()
  const result = await fp.get()
  
  // Get or create localStorage UUID
  let localId = ''
  if (typeof window !== 'undefined') {
    localId = localStorage.getItem('visitor_id') || ''
    if (!localId) {
      localId = crypto.randomUUID()
      localStorage.setItem('visitor_id', localId)
    }
  }
  
  // Combine IP, fingerprint, and localStorage ID
  const combined = `${ip}:${result.visitorId}:${localId}`
  
  // Return hashed version for privacy
  return createHash('sha256').update(combined).digest('hex')
}

export function hashVisitorId(visitorId: string): string {
  return createHash('sha256').update(visitorId).digest('hex')
}