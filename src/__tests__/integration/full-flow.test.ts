/**
 * Integration tests for the complete promo code flow
 * These tests simulate the full user journey from campaign creation to code claiming
 */

import { NextRequest } from 'next/server'
import { POST as createCampaign } from '@/app/api/campaigns/route'
import { POST as claimCode } from '@/app/api/claim/[id]/route'
import { GET as getManagement } from '@/app/api/manage/[slug]/route'
import { POST as adminClaim } from '@/app/api/manage/[slug]/claim-code/route'

// Mock all external dependencies
jest.mock('@/lib/supabase')
jest.mock('@/lib/utils')
jest.mock('@/lib/reddit')
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mock-id')
}))

const mockSupabaseAdmin = {
  from: jest.fn()
}

const mockGetClientIP = jest.fn(() => '192.168.1.1')
const mockFetchRedditPostContent = jest.fn()

beforeAll(async () => {
  const supabaseModule = await import('@/lib/supabase')
  const utilsModule = await import('@/lib/utils')
  const redditModule = await import('@/lib/reddit')
  
  Object.assign(supabaseModule.supabaseAdmin, mockSupabaseAdmin)
  Object.assign(utilsModule.getClientIP, mockGetClientIP)
  Object.assign(redditModule.fetchRedditPostContent, mockFetchRedditPostContent)
})

describe('Complete Promo Code Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Campaign creation to code claiming flow', () => {
    it('should handle complete flow: create campaign -> claim code -> admin management', async () => {
      // Step 1: Create Campaign
      mockSupabaseAdmin.from.mockReturnValue({
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
      })

      const createRequest = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          promoCodes: ['TESTCODE1', 'TESTCODE2', 'TESTCODE3'],
          expiresAt: '2024-12-31T23:59:59.000Z',
          requireRedditVerification: false,
          redditPostUrl: ''
        })
      })

      const createResponse = await createCampaign(createRequest)
      const createData = await createResponse.json()

      expect(createResponse.status).toBe(200)
      expect(createData.campaignId).toBe('test-campaign-id')

      // Step 2: User Claims Code
      mockSupabaseAdmin.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: {
                  id: 'test-campaign-id',
                  require_reddit_verification: false,
                  expires_at: null
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
                    data: { id: 'code-1', value: 'TESTCODE1' },
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

      const claimRequest = new NextRequest('http://localhost:3000/api/claim/test-campaign-id', {
        method: 'POST',
        body: JSON.stringify({
          recaptchaToken: 'valid-token'
        }),
        headers: {
          'User-Agent': 'test-browser'
        }
      })

      const claimResponse = await claimCode(claimRequest, { 
        params: Promise.resolve({ id: 'test-campaign-id' }) 
      })
      const claimData = await claimResponse.json()

      expect(claimResponse.status).toBe(200)
      expect(claimData.code).toBe('TESTCODE1')

      // Step 3: Admin Views Management
      mockSupabaseAdmin.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: {
                    id: 'test-campaign-id',
                    created_at: '2024-01-01T00:00:00.000Z',
                    expires_at: '2024-12-31T23:59:59.000Z'
                  },
                  error: null
                }))
              }))
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: [
                  { id: 'code-1', value: 'TESTCODE1', claimed_by: 'user-hash', claimed_at: '2024-01-01T12:00:00.000Z' },
                  { id: 'code-2', value: 'TESTCODE2', claimed_by: null, claimed_at: null },
                  { id: 'code-3', value: 'TESTCODE3', claimed_by: null, claimed_at: null }
                ],
                error: null
              }))
            }))
          }))
        })

      const managementRequest = new NextRequest('http://localhost:3000/api/manage/test-campaign-id-test-admin-key')

      const managementResponse = await getManagement(managementRequest, { 
        params: Promise.resolve({ slug: 'test-campaign-id-test-admin-key' }) 
      })
      const managementData = await managementResponse.json()

      expect(managementResponse.status).toBe(200)
      expect(managementData.stats.totalCodes).toBe(3)
      expect(managementData.stats.claimedCodes).toBe(1)
      expect(managementData.codes).toHaveLength(3)

      // Step 4: Admin Claims Code
      mockSupabaseAdmin.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { id: 'test-campaign-id' },
                  error: null
                }))
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
                    data: { id: 'code-2', value: 'TESTCODE2' },
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

      const adminClaimRequest = new NextRequest('http://localhost:3000/api/manage/test-campaign-id-test-admin-key/claim-code', {
        method: 'POST'
      })

      const adminClaimResponse = await adminClaim(adminClaimRequest, { 
        params: Promise.resolve({ slug: 'test-campaign-id-test-admin-key' }) 
      })
      const adminClaimData = await adminClaimResponse.json()

      expect(adminClaimResponse.status).toBe(200)
      expect(adminClaimData.code).toBe('TESTCODE2')
      expect(adminClaimData.message).toBe('Code claimed successfully by admin')
    })

    it('should handle Reddit verification flow', async () => {
      mockFetchRedditPostContent.mockResolvedValue({
        usernames: ['validuser', 'anotheruser']
      })

      // Create campaign with Reddit verification
      mockSupabaseAdmin.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: {
                id: 'reddit-campaign',
                admin_key: 'reddit-admin-key'
              },
              error: null
            }))
          }))
        }))
      })

      const createRequest = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          promoCodes: ['REDDIT1', 'REDDIT2'],
          expiresAt: '2024-12-31T23:59:59.000Z',
          requireRedditVerification: true,
          redditPostUrl: 'https://www.reddit.com/r/test/comments/123/title/'
        })
      })

      const createResponse = await createCampaign(createRequest)
      expect(createResponse.status).toBe(200)

      // Claim with valid Reddit username
      mockSupabaseAdmin.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: {
                  id: 'reddit-campaign',
                  require_reddit_verification: true,
                  reddit_post_url: 'https://www.reddit.com/r/test/comments/123/title/',
                  expires_at: null
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
                    data: { id: 'reddit-code-1', value: 'REDDIT1' },
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

      const claimRequest = new NextRequest('http://localhost:3000/api/claim/reddit-campaign', {
        method: 'POST',
        body: JSON.stringify({
          recaptchaToken: 'valid-token',
          redditUsername: 'validuser'
        })
      })

      const claimResponse = await claimCode(claimRequest, { 
        params: Promise.resolve({ id: 'reddit-campaign' }) 
      })
      const claimData = await claimResponse.json()

      expect(claimResponse.status).toBe(200)
      expect(claimData.code).toBe('REDDIT1')
      expect(mockFetchRedditPostContent).toHaveBeenCalledWith('https://www.reddit.com/r/test/comments/123/title/')
    })

    it('should handle bypass flow correctly', async () => {
      // Mock campaign with Reddit verification
      mockSupabaseAdmin.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: {
                  id: 'bypass-campaign',
                  require_reddit_verification: true,
                  reddit_post_url: 'https://www.reddit.com/r/test/comments/123/title/',
                  expires_at: null
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
                    data: { id: 'bypass-code-1', value: 'BYPASS1' },
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

      const claimRequest = new NextRequest('http://localhost:3000/api/claim/bypass-campaign', {
        method: 'POST',
        body: JSON.stringify({
          recaptchaToken: 'bypass_test-token'
        })
      })

      const claimResponse = await claimCode(claimRequest, { 
        params: Promise.resolve({ id: 'bypass-campaign' }) 
      })
      const claimData = await claimResponse.json()

      expect(claimResponse.status).toBe(200)
      expect(claimData.code).toBe('BYPASS1')
      // Should not call Reddit verification for bypass
      expect(mockFetchRedditPostContent).not.toHaveBeenCalled()
    })
  })
})