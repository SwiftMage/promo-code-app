import { NextRequest } from 'next/server'
import { POST } from '@/app/api/claim/[id]/route'

// Mock modules
jest.mock('@/lib/supabase')
jest.mock('@/lib/utils')
jest.mock('@/lib/reddit')

const mockSupabaseAdmin = {
  from: jest.fn()
}

const mockGetClientIP = jest.fn(() => '192.168.1.1')
const mockFetchRedditPostContent = jest.fn()

// This needs to be done in beforeAll to ensure mocks are set up
beforeAll(async () => {
  const supabaseModule = await import('@/lib/supabase')
  const utilsModule = await import('@/lib/utils')
  const redditModule = await import('@/lib/reddit')
  
  Object.assign(supabaseModule.supabaseAdmin, mockSupabaseAdmin)
  Object.assign(utilsModule.getClientIP, mockGetClientIP)
  Object.assign(redditModule.fetchRedditPostContent, mockFetchRedditPostContent)
})

describe('/api/claim/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default campaign mock
    mockSupabaseAdmin.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'test-campaign',
              require_reddit_verification: false,
              expires_at: null
            },
            error: null
          }))
        }))
      }))
    })
  })

  describe('Normal claim flow', () => {
    it('should claim a code successfully', async () => {
      // Mock available code
      mockSupabaseAdmin.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'test-campaign', require_reddit_verification: false, expires_at: null },
                error: null
              }))
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: null,
                error: { code: 'PGRST116' } // No existing code
              }))
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              is: jest.fn(() => ({
                limit: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'code-id', value: 'TESTCODE123' },
                    error: null
                  }))
                }))
              }))
            }))
          }))
        })
        .mockReturnValueOnce({
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null }))
          }))
        })

      const request = new NextRequest('http://localhost:3000/api/claim/test-campaign', {
        method: 'POST',
        body: JSON.stringify({
          recaptchaToken: 'valid-token'
        }),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'test-browser'
        }
      })

      const response = await POST(request, { params: Promise.resolve({ id: 'test-campaign' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.code).toBe('TESTCODE123')
    })

    it('should handle bypass tokens', async () => {
      // Mock campaign with Reddit verification
      mockSupabaseAdmin.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { 
                  id: 'test-campaign', 
                  require_reddit_verification: true,
                  reddit_post_url: 'https://reddit.com/test'
                },
                error: null
              }))
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: null,
                error: { code: 'PGRST116' }
              }))
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              is: jest.fn(() => ({
                limit: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'code-id', value: 'BYPASSCODE123' },
                    error: null
                  }))
                }))
              }))
            }))
          }))
        })
        .mockReturnValueOnce({
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null }))
          }))
        })

      const request = new NextRequest('http://localhost:3000/api/claim/test-campaign', {
        method: 'POST',
        body: JSON.stringify({
          recaptchaToken: 'bypass_test-token'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request, { params: Promise.resolve({ id: 'test-campaign' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.code).toBe('BYPASSCODE123')
    })

    it('should validate Reddit username when required', async () => {
      mockFetchRedditPostContent.mockResolvedValue({
        usernames: ['testuser', 'anotheruser']
      })

      // Mock campaign with Reddit verification
      mockSupabaseAdmin.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { 
                  id: 'test-campaign', 
                  require_reddit_verification: true,
                  reddit_post_url: 'https://reddit.com/test'
                },
                error: null
              }))
            }))
          }))
        })

      const request = new NextRequest('http://localhost:3000/api/claim/test-campaign', {
        method: 'POST',
        body: JSON.stringify({
          recaptchaToken: 'valid-token',
          redditUsername: 'nonexistentuser'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request, { params: Promise.resolve({ id: 'test-campaign' }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Username "nonexistentuser" not found')
    })

    it('should handle expired campaigns', async () => {
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: {
                id: 'test-campaign',
                require_reddit_verification: false,
                expires_at: '2023-01-01T00:00:00.000Z' // Past date
              },
              error: null
            }))
          }))
        }))
      })

      const request = new NextRequest('http://localhost:3000/api/claim/test-campaign', {
        method: 'POST',
        body: JSON.stringify({
          recaptchaToken: 'valid-token'
        })
      })

      const response = await POST(request, { params: Promise.resolve({ id: 'test-campaign' }) })
      const data = await response.json()

      expect(response.status).toBe(410)
      expect(data.error).toBe('Campaign has expired')
    })

    it('should handle no available codes', async () => {
      mockSupabaseAdmin.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'test-campaign', require_reddit_verification: false },
                error: null
              }))
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: null,
                error: { code: 'PGRST116' }
              }))
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              is: jest.fn(() => ({
                limit: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: null,
                    error: { code: 'PGRST116' }
                  }))
                }))
              }))
            }))
          }))
        })

      const request = new NextRequest('http://localhost:3000/api/claim/test-campaign', {
        method: 'POST',
        body: JSON.stringify({
          recaptchaToken: 'valid-token'
        })
      })

      const response = await POST(request, { params: Promise.resolve({ id: 'test-campaign' }) })
      const data = await response.json()

      expect(response.status).toBe(410)
      expect(data.error).toBe('All promo codes have been claimed')
    })
  })
})