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
    
    // Try different methods to fetch Reddit content
    let data;
    let response;
    
    // Method 1: Try JSON endpoint with simple headers
    try {
      const jsonUrl = cleanUrl.endsWith('.json') ? cleanUrl : `${cleanUrl}.json`;
      console.log('Attempting to fetch Reddit JSON:', jsonUrl);
      
      response = await fetch(jsonUrl);
      
      if (response.ok) {
        data = await response.json();
        console.log('Successfully fetched Reddit JSON');
      }
    } catch (error) {
      console.log('JSON fetch failed, trying alternative method:', error);
    }
    
    // Method 2: If JSON fails, try with old.reddit.com
    if (!data) {
      try {
        const oldRedditUrl = cleanUrl.replace('www.reddit.com', 'old.reddit.com');
        const oldJsonUrl = oldRedditUrl.endsWith('.json') ? oldRedditUrl : `${oldRedditUrl}.json`;
        console.log('Attempting old.reddit.com:', oldJsonUrl);
        
        response = await fetch(oldJsonUrl);
        
        if (response.ok) {
          data = await response.json();
          console.log('Successfully fetched from old.reddit.com');
        }
      } catch (error) {
        console.log('Old Reddit fetch failed:', error);
      }
    }
    
    if (!data) {
      throw new Error('Failed to fetch Reddit post from all methods. The post may be private or deleted.');
    }
    
    console.log('Reddit data structure:', JSON.stringify(data).substring(0, 200) + '...');
    
    // Reddit JSON structure: data is an array where [0] is the post, [1] is comments
    const comments: RedditComment[] = data[1]?.data?.children || [];
    
    console.log('Found comments:', comments.length);
    
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
    
    // Remove duplicates and return both usernames and combined comment text
    return {
      usernames: [...new Set(usernames)],
      allCommentText: commentTexts.join(' ').toLowerCase()
    };
    
  } catch (error) {
    console.error('Error fetching Reddit post:', error);
    throw new Error('Failed to fetch Reddit post content');
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