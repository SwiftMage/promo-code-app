import { fetchRedditPostContent, validateRedditUrl } from '@/lib/reddit'

// Mock fetch
global.fetch = jest.fn()

describe('Reddit functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateRedditUrl', () => {
    it('should validate correct Reddit URLs', () => {
      const validUrls = [
        'https://www.reddit.com/r/test/comments/123/title/',
        'https://reddit.com/r/javascript/comments/abc123/discussion/',
        'http://www.reddit.com/r/programming/comments/xyz/post/'
      ]

      validUrls.forEach(url => {
        expect(validateRedditUrl(url)).toBe(true)
      })
    })

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'https://google.com',
        'not-a-url',
        'https://www.reddit.com/r/test', // Missing /comments/
        ''
      ]

      invalidUrls.forEach(url => {
        expect(validateRedditUrl(url)).toBe(false)
      })
    })
  })

  describe('fetchRedditPostContent', () => {
    it('should extract usernames from Reddit JSON', async () => {
      const mockRedditResponse = [
        {}, // Post data
        {
          data: {
            children: [
              {
                data: {
                  author: 'testuser1',
                  body: 'This is a comment'
                }
              },
              {
                data: {
                  author: 'testuser2',
                  body: 'Another comment',
                  replies: {
                    data: {
                      children: [
                        {
                          data: {
                            author: 'testuser3',
                            body: 'A reply'
                          }
                        }
                      ]
                    }
                  }
                }
              },
              {
                data: {
                  author: '[deleted]',
                  body: 'Deleted comment'
                }
              },
            ]
          }
        }
      ]

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve(mockRedditResponse)
        })

      const result = await fetchRedditPostContent('https://www.reddit.com/r/test/comments/123/title/')

      expect(result.usernames).toEqual(['testuser1', 'testuser2', 'testuser3'])
      expect(result.usernames).not.toContain('[deleted]')
      expect(result.usernames).not.toContain('AutoModerator')
    })

    it('should handle CORS proxy fallback', async () => {
      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('CORS error'))
        .mockRejectedValueOnce(new Error('Proxy 1 failed'))
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'text/html' },
          text: () => Promise.resolve(`
            <html>
              <div>
                <a href="/user/htmluser1">htmluser1</a>
                <a href="/user/htmluser2">htmluser2</a>
              </div>
            </html>
          `)
        })

      const result = await fetchRedditPostContent('https://www.reddit.com/r/test/comments/123/title/')

      expect(result.usernames).toContain('htmluser1')
      expect(result.usernames).toContain('htmluser2')
    })

    it('should fallback to server-side fetch when all proxies fail', async () => {
      // Mock all CORS proxies failing
      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Proxy failed'))
        .mockRejectedValueOnce(new Error('Proxy failed'))
        .mockRejectedValueOnce(new Error('Proxy failed'))
        .mockRejectedValueOnce(new Error('Proxy failed'))
        .mockRejectedValueOnce(new Error('Proxy failed'))
        // Mock server-side fetch success
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            usernames: ['serveruser1', 'serveruser2']
          })
        })

      const result = await fetchRedditPostContent('https://www.reddit.com/r/test/comments/123/title/')

      expect(result.usernames).toEqual(['serveruser1', 'serveruser2'])
    })

    it('should handle HTML parsing with various username patterns', async () => {
      const mockHtml = `
        <html>
          <body>
            <a href="/user/user1">user1</a>
            <a href="/u/user2">user2</a>
            <a href="https://www.reddit.com/user/user3">user3</a>
            <span data-author="user4">Comment by user4</span>
            <div class="author">u/user5</div>
          </body>
        </html>
      `

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'text/html' },
          text: () => Promise.resolve(mockHtml)
        })

      const result = await fetchRedditPostContent('https://www.reddit.com/r/test/comments/123/title/')

      expect(result.usernames).toContain('user1')
      expect(result.usernames).toContain('user2')
      expect(result.usernames).toContain('user3')
    })

    it('should handle network errors gracefully', async () => {
      ;(global.fetch as jest.Mock)
        .mockRejectedValue(new Error('Network error'))

      await expect(fetchRedditPostContent('https://www.reddit.com/r/test/comments/123/title/'))
        .rejects.toThrow('Unable to verify Reddit post')
    })

    it('should remove duplicates from username list', async () => {
      const mockRedditResponse = [
        {},
        {
          data: {
            children: [
              { data: { author: 'duplicateuser' } },
              { data: { author: 'duplicateuser' } },
              { data: { author: 'uniqueuser' } }
            ]
          }
        }
      ]

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve(mockRedditResponse)
        })

      const result = await fetchRedditPostContent('https://www.reddit.com/r/test/comments/123/title/')

      expect(result.usernames).toEqual(['duplicateuser', 'uniqueuser'])
      expect(result.usernames.length).toBe(2)
    })
  })
})