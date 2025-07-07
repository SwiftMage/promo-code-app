import { nanoid } from 'nanoid'

export function generateCampaignId(): string {
  return nanoid(10)
}

export function generateAdminKey(): string {
  return nanoid(32)
}

export function deduplicateCodes(codes: string[]): string[] {
  return [...new Set(codes.map(code => code.trim()).filter(Boolean))]
}

export function parseCodesInput(input: string): string[] {
  return input
    .split(/[,\n\r]+/)
    .map(code => code.trim())
    .filter(Boolean)
}

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  return '127.0.0.1'
}