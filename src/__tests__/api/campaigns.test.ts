import { NextRequest } from 'next/server'
import { POST } from '@/app/api/campaigns/route'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'test-campaign-id',
              admin_key: 'test-admin-key'
            },
            error: null
          }))
        }))
      }))
    }))
  }
}))

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mock-id')
}))

describe('/api/campaigns', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('should create a campaign successfully', async () => {
      const requestBody = {
        promoCodes: ['CODE1', 'CODE2', 'CODE3'],
        expiresAt: '2024-12-31T23:59:59.000Z',
        requireRedditVerification: false,
        redditPostUrl: ''
      }

      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('campaignId', 'test-campaign-id')
      expect(data).toHaveProperty('claimUrl')
      expect(data).toHaveProperty('managementUrl')
      expect(data.claimUrl).toContain('/claim/test-campaign-id')
      expect(data.managementUrl).toContain('/manage/test-campaign-id-test-admin-key')
    })

    it('should validate required fields', async () => {
      const requestBody = {
        promoCodes: [],
        expiresAt: '',
        requireRedditVerification: false,
        redditPostUrl: ''
      }

      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('At least one promo code is required')
    })

    it('should validate expiration date', async () => {
      const requestBody = {
        promoCodes: ['CODE1'],
        expiresAt: '2023-01-01T00:00:00.000Z', // Past date
        requireRedditVerification: false,
        redditPostUrl: ''
      }

      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Expiration date must be in the future')
    })

    it('should require Reddit URL when Reddit verification is enabled', async () => {
      const requestBody = {
        promoCodes: ['CODE1'],
        expiresAt: '2024-12-31T23:59:59.000Z',
        requireRedditVerification: true,
        redditPostUrl: ''
      }

      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Reddit post URL is required')
    })

    it('should validate Reddit URL format', async () => {
      const requestBody = {
        promoCodes: ['CODE1'],
        expiresAt: '2024-12-31T23:59:59.000Z',
        requireRedditVerification: true,
        redditPostUrl: 'https://not-reddit.com/post'
      }

      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid Reddit URL')
    })
  })
})