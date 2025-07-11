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
    
    // Use CORS proxy method (the only reliable method)
    const jsonUrl = cleanUrl.endsWith('.json') ? cleanUrl : `${cleanUrl}.json`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(jsonUrl)}`;
    
    console.log('Fetching Reddit content via CORS proxy:', proxyUrl);
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`CORS proxy returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched Reddit content via CORS proxy');
    
    // Log the data structure for debugging
    console.log('Reddit data structure:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    
    // Check if we got valid Reddit data
    if (!Array.isArray(data) || data.length < 2) {
      console.error('Invalid Reddit data structure:', data);
      throw new Error('Invalid Reddit post data - the post may be private, deleted, or the URL is incorrect');
    }
    
    // Reddit JSON structure: data is an array where [0] is the post, [1] is comments
    const comments: RedditComment[] = data[1]?.data?.children || [];
    
    console.log('Found comments:', comments.length);
    
    if (comments.length === 0) {
      console.warn('No comments found in Reddit post');
    }
    
    const usernames: string[] = [];
    const commentTexts: string[] = [];
    
    // Extract usernames and comment text from comments
    function extractData(comment: RedditComment) {
      if (comment.data?.author && comment.data.author !== '[deleted]') {
        usernames.push(comment.data.author);
        if (comment.data.body) {
          commentTexts.push(comment.data.body);
        }
      }
      
      // Recursively check replies
      if (comment.data?.replies?.data?.children) {
        comment.data.replies.data.children.forEach(extractData);
      }
    }
    
    comments.forEach(extractData);
    
    console.log('Extracted usernames:', usernames);
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
        throw new Error(`Reddit fetch failed: ${error.message}. The post may be private or deleted.`);
      } else if (error.message.includes('Invalid Reddit post data')) {
        throw error; // Use the specific error message
      } else {
        throw new Error(`Reddit fetch error: ${error.message}`);
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