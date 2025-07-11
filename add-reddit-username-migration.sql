-- Add reddit_username column to promo_codes table
-- This will store the Reddit username that was used to claim each code

ALTER TABLE promo_codes 
ADD COLUMN reddit_username TEXT;

-- Create index for performance when filtering by Reddit username
CREATE INDEX idx_promo_codes_reddit_username ON promo_codes(reddit_username);

-- Add comment to document the column
COMMENT ON COLUMN promo_codes.reddit_username IS 'Reddit username used for verification when claiming this code';