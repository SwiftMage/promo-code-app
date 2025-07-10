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
    // Ensure we're getting the JSON version of the post
    const jsonUrl = postUrl.endsWith('.json') ? postUrl : `${postUrl}.json`;
    
    const response = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'PromoDistro/1.0 (Code verification bot)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Reddit post: ${response.status}`);
    }

    const data = await response.json();
    
    // Reddit JSON structure: data is an array where [0] is the post, [1] is comments
    const comments: RedditComment[] = data[1]?.data?.children || [];
    
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