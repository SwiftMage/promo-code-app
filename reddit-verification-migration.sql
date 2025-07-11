-- Migration to add Reddit verification columns to existing campaigns table
-- Run this in your Supabase SQL Editor

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS require_reddit_verification BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reddit_post_url TEXT;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
AND column_name IN ('require_reddit_verification', 'reddit_post_url');