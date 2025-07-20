import { getClientIP } from '@/lib/utils'
import { NextRequest } from 'next/server'

describe('Utility functions', () => {
  describe('getClientIP', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.100, 10.0.0.1'
        }
      })

      const ip = getClientIP(request)
      expect(ip).toBe('192.168.1.100')
    })

    it('should extract IP from x-real-ip header when x-forwarded-for is not available', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-real-ip': '192.168.1.200'
        }
      })

      const ip = getClientIP(request)
      expect(ip).toBe('192.168.1.200')
    })

    it('should extract IP from x-client-ip header as fallback', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-client-ip': '192.168.1.300'
        }
      })

      const ip = getClientIP(request)
      expect(ip).toBe('192.168.1.300')
    })

    it('should return default IP when no headers are present', () => {
      const request = new NextRequest('http://localhost:3000')

      const ip = getClientIP(request)
      expect(ip).toBe('127.0.0.1')
    })

    it('should handle IPv6 addresses', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '2001:db8::1'
        }
      })

      const ip = getClientIP(request)
      expect(ip).toBe('2001:db8::1')
    })

    it('should handle multiple IPs in x-forwarded-for and return the first', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1'
        }
      })

      const ip = getClientIP(request)
      expect(ip).toBe('203.0.113.1')
    })

    it('should trim whitespace from IP addresses', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '  192.168.1.100  '
        }
      })

      const ip = getClientIP(request)
      expect(ip).toBe('192.168.1.100')
    })
  })
})