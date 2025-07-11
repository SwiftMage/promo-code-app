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
    
    // Use CORS proxy to fetch HTML (not JSON)
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`;
    
    console.log('Fetching Reddit HTML via CORS proxy:', proxyUrl);
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`CORS proxy returned ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log('Successfully fetched Reddit HTML, length:', html.length);
    
    // Check if we got HTML
    if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
      console.error('Response doesn\'t appear to be HTML:', html.substring(0, 200));
      throw new Error('Invalid response - expected HTML but got something else');
    }
    
    // Extract usernames and comment text using regex patterns
    const usernames: string[] = [];
    const commentTexts: string[] = [];
    
    // Pattern to find comment authors - Reddit uses specific class names
    // Look for patterns like: href="/user/username" or data-author="username"
    const authorPattern1 = /href="\/user\/([^"\/]+)"/g;
    const authorPattern2 = /data-author="([^"]+)"/g;
    const authorPattern3 = /class="[^"]*author[^"]*"[^>]*>([^<]+)</g;
    
    // Extract usernames
    let match;
    while ((match = authorPattern1.exec(html)) !== null) {
      if (match[1] && match[1] !== '[deleted]' && match[1] !== 'AutoModerator') {
        usernames.push(match[1]);
      }
    }
    
    while ((match = authorPattern2.exec(html)) !== null) {
      if (match[1] && match[1] !== '[deleted]' && match[1] !== 'AutoModerator') {
        usernames.push(match[1]);
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
    
    console.log('Total unique usernames found:', [...new Set(usernames)].length);
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
      if (error.message.includes('CORS proxy returned')) {
        throw new Error(`Unable to access Reddit post. The post may be private or deleted.`);
      } else if (error.message.includes('Invalid response')) {
        throw new Error('Unable to read Reddit post content. Please check the URL and try again.');
      } else if (error.message.includes('not valid JSON')) {
        // This shouldn't happen anymore, but just in case
        throw new Error('Reddit server returned unexpected format. Please try again later.');
      } else {
        throw new Error(`Unable to verify Reddit post: ${error.message}. Please check the Reddit URL and try again.`);
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