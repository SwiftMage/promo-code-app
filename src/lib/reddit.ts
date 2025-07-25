
export async function fetchRedditPostContent(postUrl: string): Promise<{usernames: string[]}> {
  try {
    // Clean the URL - remove trailing slashes and ensure proper format
    let cleanUrl = postUrl.trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    
    // Try multiple CORS proxies in order of reliability
    const corsProxies = [
      // Add .json endpoint as first attempt
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url + '.json')}`,
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
    ];
    
    let html = '';
    
    // Try each proxy until one works
    for (const proxyFn of corsProxies) {
      try {
        const proxyUrl = proxyFn(cleanUrl);
        console.log('Trying CORS proxy:', proxyUrl.substring(0, 50) + '...');
        
        const response = await fetch(proxyUrl, {
          headers: {
            'Accept': proxyUrl.includes('.json') ? 'application/json' : 'text/html,application/xhtml+xml',
            'User-Agent': 'Mozilla/5.0 (compatible; PromoCodeApp/1.0)'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Proxy returned ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type') || '';
        
        // Check if we got JSON (from .json endpoint)
        if (contentType.includes('application/json') || proxyUrl.includes('.json')) {
          try {
            const jsonData = await response.json();
            console.log('Got JSON response, converting to username list');
            
            // Extract usernames from Reddit JSON structure
            const extractedUsers: string[] = [];
            
            // Navigate through Reddit JSON structure
            if (Array.isArray(jsonData) && jsonData[1]?.data?.children) {
              const comments = jsonData[1].data.children;
              
              function extractFromComment(comment: Record<string, unknown>) {
                const data = comment.data as Record<string, unknown>;
                if (data?.author && typeof data.author === 'string' && data.author !== '[deleted]') {
                  extractedUsers.push(data.author);
                }
                const replies = data?.replies as Record<string, unknown>;
                const repliesData = replies?.data as Record<string, unknown>;
                if (repliesData?.children && Array.isArray(repliesData.children)) {
                  repliesData.children.forEach(extractFromComment);
                }
              }
              
              comments.forEach(extractFromComment);
            }
            
            if (extractedUsers.length > 0) {
              console.log('Successfully extracted users from JSON:', extractedUsers.length);
              return {
                usernames: [...new Set(extractedUsers)]
              };
            }
          } catch {
            console.log('JSON parsing failed, treating as HTML');
          }
        }
        
        // Otherwise treat as HTML
        html = await response.text();
        
        // Verify we got actual content
        if (html.length < 1000) {
          throw new Error('Response too short to be valid Reddit content');
        }
        
        console.log('Successfully fetched content, length:', html.length);
        break; // Success! Exit the loop
        
      } catch (error) {
        console.error('Proxy failed:', error);
        continue; // Try next proxy
      }
    }
    
    if (!html || html.length === 0) {
      console.log('All CORS proxies failed, trying server-side fetch...');
      
      // Fallback to server-side fetch
      try {
        const response = await fetch('/api/reddit-fetch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: cleanUrl }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || error.error || 'Server fetch failed');
        }
        
        const data = await response.json();
        
        if (data.success && data.usernames) {
          console.log('Server-side fetch successful, found users:', data.usernames.length);
          return {
            usernames: data.usernames
          };
        }
        
        throw new Error('Server returned invalid data');
        
      } catch (serverError) {
        console.error('Server-side fetch also failed:', serverError);
        throw new Error('Unable to fetch Reddit data through any method');
      }
    }
    
    // Check if we got HTML
    if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
      console.error('Response doesn\'t appear to be HTML:', html.substring(0, 200));
      throw new Error('Invalid response - expected HTML but got something else');
    }
    
    // Log a sample of the HTML to help debug username extraction
    const sampleStart = html.indexOf('BETO123USA');
    if (sampleStart !== -1) {
      console.log('Found BETO123USA in HTML at position:', sampleStart);
      console.log('Context around username:', html.substring(Math.max(0, sampleStart - 100), sampleStart + 100));
    } else {
      console.log('BETO123USA not found in raw HTML');
      // Look for any /user/ links to debug
      const userLinkSample = html.match(/\/user\/[^"\/]+/);
      if (userLinkSample) {
        console.log('Sample user link found:', userLinkSample[0]);
      }
    }
    
    // Extract usernames using regex patterns
    const usernames: string[] = [];
    
    // Comprehensive patterns to find comment authors in various Reddit HTML formats
    const authorPatterns = [
      // Standard Reddit patterns
      /href="\/user\/([^"\/]+)"/g,
      /data-author="([^"]+)"/g,
      /class="[^"]*author[^"]*"[^>]*>([^<]+)</g,
      
      // New Reddit patterns
      /href="https?:\/\/www\.reddit\.com\/user\/([^"\/]+)"/g,
      /href="\/u\/([^"\/]+)"/g,
      /data-username="([^"]+)"/g,
      
      // Reddit redesign patterns
      /"author":"([^"]+)"/g,
      /"authorUsername":"([^"]+)"/g,
      /Comment by u\/([^\s]+)/g,
      
      // Mobile Reddit patterns
      /class="[^"]*Comment__author[^"]*"[^>]*>([^<]+)</g,
      /<span[^>]*class="[^"]*author[^"]*"[^>]*>u\/([^<]+)</g,
      
      // JSON-LD structured data
      /"author":\s*{\s*"name":\s*"([^"]+)"/g,
    ];
    
    // Try all patterns
    for (const pattern of authorPatterns) {
      let match;
      pattern.lastIndex = 0; // Reset regex state
      while ((match = pattern.exec(html)) !== null) {
        const username = match[1].replace(/^u\//, ''); // Remove u/ prefix if present
        if (username && username !== '[deleted]' && username !== 'AutoModerator' && !username.includes(' ')) {
          usernames.push(username);
        }
      }
    }
    
    console.log('Extracted usernames from HTML:', usernames);
    
    
    const uniqueUsernames = [...new Set(usernames)];
    console.log('Total unique usernames found:', uniqueUsernames.length);
    console.log('First 10 usernames:', uniqueUsernames.slice(0, 10));
    
    // Remove duplicates and return usernames
    return {
      usernames: [...new Set(usernames)]
    };
    
  } catch (error) {
    console.error('Error fetching Reddit post:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      url: postUrl
    });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('All CORS proxies failed')) {
        throw new Error('Unable to access Reddit post. The Reddit servers may be temporarily unavailable. Please try again in a few moments.');
      } else if (error.message.includes('Proxy returned')) {
        throw new Error('Unable to access Reddit post. The post may be private, deleted, or Reddit may be blocking access.');
      } else if (error.message.includes('Invalid response')) {
        throw new Error('Unable to read Reddit post content. Please verify the URL is correct and the post is publicly accessible.');
      } else if (error.message.includes('doesn\'t appear to be Reddit content')) {
        throw new Error('The URL doesn\'t seem to point to a valid Reddit post. Please check the URL and try again.');
      } else {
        throw new Error(`Unable to verify Reddit post. Please check that the Reddit post is public and try again.`);
      }
    } else {
      throw new Error('Unknown error occurred while fetching Reddit post');
    }
  }
}

export function validateRedditUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('reddit.com') && 
           parsed.pathname.includes('/comments/');
  } catch {
    return false;
  }
}