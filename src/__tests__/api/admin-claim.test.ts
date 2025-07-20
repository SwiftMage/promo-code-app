import { NextRequest } from 'next/server'
import { POST } from '@/app/api/manage/[slug]/claim-code/route'

// Mock Supabase
const mockSupabaseAdmin = {
  from: jest.fn()
}

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: mockSupabaseAdmin
}))

describe('/api/manage/[slug]/claim-code', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should allow admin to claim a code successfully', async () => {
    // Mock campaign validation
    mockSupabaseAdmin.from
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'test-campaign' },
                error: null
              }))
            }))
          }))
        }))
      })
      // Mock available code
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            is: jest.fn(() => ({
              limit: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { id: 'code-1', value: 'ADMINCODE123' },
                  error: null
                }))
              }))
            }))
          }))
        }))
      })
      // Mock code update
      .mockReturnValueOnce({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null }))
        }))
      })

    const request = new NextRequest('http://localhost:3000/api/manage/test-campaign-admin-key/claim-code', {
      method: 'POST'
    })

    const response = await POST(request, { 
      params: Promise.resolve({ slug: 'test-campaign-admin-key' }) 
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.code).toBe('ADMINCODE123')
    expect(data.message).toBe('Code claimed successfully by admin')
  })

  it('should validate management slug format', async () => {
    const request = new NextRequest('http://localhost:3000/api/manage/invalid-slug/claim-code', {
      method: 'POST'
    })

    const response = await POST(request, { 
      params: Promise.resolve({ slug: 'invalid-slug' }) 
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid management link')
  })

  it('should validate admin credentials', async () => {
    mockSupabaseAdmin.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { code: 'PGRST116' }
            }))
          }))
        }))
      }))
    })

    const request = new NextRequest('http://localhost:3000/api/manage/test-campaign-wrong-key/claim-code', {
      method: 'POST'
    })

    const response = await POST(request, { 
      params: Promise.resolve({ slug: 'test-campaign-wrong-key' }) 
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Invalid management link')
  })

  it('should handle no available codes', async () => {
    // Mock campaign validation success
    mockSupabaseAdmin.from
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'test-campaign' },
                error: null
              }))
            }))
          }))
        }))
      })
      // Mock no available codes
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

    const request = new NextRequest('http://localhost:3000/api/manage/test-campaign-admin-key/claim-code', {
      method: 'POST'
    })

    const response = await POST(request, { 
      params: Promise.resolve({ slug: 'test-campaign-admin-key' }) 
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('No available codes')
  })

  it('should handle database update errors', async () => {
    // Mock campaign validation
    mockSupabaseAdmin.from
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'test-campaign' },
                error: null
              }))
            }))
          }))
        }))
      })
      // Mock available code
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            is: jest.fn(() => ({
              limit: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { id: 'code-1', value: 'ADMINCODE123' },
                  error: null
                }))
              }))
            }))
          }))
        }))
      })
      // Mock update failure
      .mockReturnValueOnce({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ 
            error: { message: 'Update failed' } 
          }))
        }))
      })

    const request = new NextRequest('http://localhost:3000/api/manage/test-campaign-admin-key/claim-code', {
      method: 'POST'
    })

    const response = await POST(request, { 
      params: Promise.resolve({ slug: 'test-campaign-admin-key' }) 
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to claim code')
  })

  it('should mark code with admin metadata', async () => {
    const mockUpdate = jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null }))
    }))

    mockSupabaseAdmin.from
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'test-campaign' },
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
                  data: { id: 'code-1', value: 'ADMINCODE123' },
                  error: null
                }))
              }))
            }))
          }))
        }))
      })
      .mockReturnValueOnce({
        update: mockUpdate
      })

    const request = new NextRequest('http://localhost:3000/api/manage/test-campaign-admin-key/claim-code', {
      method: 'POST'
    })

    await POST(request, { 
      params: Promise.resolve({ slug: 'test-campaign-admin-key' }) 
    })

    expect(mockUpdate).toHaveBeenCalledWith({
      claimed_by: 'ADMIN_CLAIM',
      claimed_at: expect.any(String),
      reddit_username: 'admin'
    })
  })
})