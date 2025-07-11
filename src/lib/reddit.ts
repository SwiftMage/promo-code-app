type RedditComment = {
  data?: {
    author?: string;
    body?: string;
    replies?: {
      data?: {
        children?: RedditComment[];
      };
    };
  };
};

export async function fetchRedditPostContent(postUrl: string): Promise<{usernames: string[], allCommentText: string}> {
  try {
    // Clean the URL - remove trailing slashes and ensure proper format
    let cleanUrl = postUrl.trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    
    // Try multiple CORS proxies in order of reliability
    const corsProxies = [
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
    ];
    
    let html = '';
    let lastError: Error | null = null;
    
    // Try each proxy until one works
    for (const proxyFn of corsProxies) {
      try {
        const proxyUrl = proxyFn(cleanUrl);
        console.log('Trying CORS proxy:', proxyUrl.substring(0, 50) + '...');
        
        const response = await fetch(proxyUrl, {
          headers: {
            'Accept': 'text/html,application/xhtml+xml',
            'User-Agent': 'Mozilla/5.0 (compatible; PromoCodeApp/1.0)'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Proxy returned ${response.status}: ${response.statusText}`);
        }
        
        html = await response.text();
        
        // Verify we got actual HTML content
        if (html.length < 1000 || (!html.includes('reddit') && !html.includes('Reddit'))) {
          throw new Error('Response doesn\'t appear to be Reddit content');
        }
        
        console.log('Successfully fetched Reddit HTML, length:', html.length);
        break; // Success! Exit the loop
        
      } catch (error) {
        lastError = error as Error;
        console.error('Proxy failed:', error);
        continue; // Try next proxy
      }
    }
    
    if (!html || html.length === 0) {
      throw lastError || new Error('All CORS proxies failed');
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
    
    // Extract usernames and comment text using regex patterns
    const usernames: string[] = [];
    const commentTexts: string[] = [];
    
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
    
    // Pattern to find comment text - look for comment body containers
    // Reddit comment bodies are usually in divs with specific classes
    const commentPattern1 = /<div[^>]*class="[^"]*md[^"]*"[^>]*>(.*?)<\/div>/gs;
    const commentPattern2 = /<p[^>]*class="[^"]*comment[^"]*"[^>]*>(.*?)<\/p>/gs;
    
    // Extract comment text
    while ((match = commentPattern1.exec(html)) !== null) {
      if (match[1]) {
        // Clean HTML tags from comment text
        const cleanText = match[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleanText.length > 0) {
          commentTexts.push(cleanText);
        }
      }
    }
    
    console.log('Extracted usernames from HTML:', usernames);
    console.log('Extracted comments:', commentTexts.length);
    
    // If we couldn't find comments with the first pattern, try a more general approach
    if (commentTexts.length === 0) {
      // Look for any text that might be comments (between common Reddit elements)
      const generalCommentPattern = /<div[^>]*(?:comment|usertext|md)[^>]*>([\s\S]*?)<\/div>/gi;
      while ((match = generalCommentPattern.exec(html)) !== null) {
        if (match[1]) {
          const cleanText = match[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          if (cleanText.length > 10 && cleanText.length < 10000) { // Reasonable comment length
            commentTexts.push(cleanText);
          }
        }
      }
    }
    
    
    const uniqueUsernames = [...new Set(usernames)];
    console.log('Total unique usernames found:', uniqueUsernames.length);
    console.log('First 10 usernames:', uniqueUsernames.slice(0, 10));
    console.log('Total comment text length:', commentTexts.join(' ').length);
    
    // Remove duplicates and return both usernames and combined comment text
    return {
      usernames: [...new Set(usernames)],
      allCommentText: commentTexts.join(' ').toLowerCase()
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