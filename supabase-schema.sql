-- Create campaigns table
CREATE TABLE campaigns (
    id TEXT PRIMARY KEY,
    admin_key TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    require_reddit_verification BOOLEAN DEFAULT FALSE,
    reddit_post_url TEXT
);

-- Create promo_codes table
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    claimed_by TEXT,
    claimed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_promo_codes_campaign_id ON promo_codes(campaign_id);
CREATE INDEX idx_promo_codes_claimed_by ON promo_codes(claimed_by);
CREATE INDEX idx_promo_codes_claimed_at ON promo_codes(claimed_at);

-- Row Level Security (RLS) policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access to read campaigns (for public claim pages)
CREATE POLICY "Allow anonymous read campaigns" ON campaigns
    FOR SELECT USING (true);

-- Allow anonymous access to read promo codes
CREATE POLICY "Allow anonymous read promo_codes" ON promo_codes
    FOR SELECT USING (true);

-- Allow anonymous insert/update for campaigns (for creating new campaigns)
CREATE POLICY "Allow anonymous insert campaigns" ON campaigns
    FOR INSERT WITH CHECK (true);

-- Allow anonymous insert/update for promo codes
CREATE POLICY "Allow anonymous insert promo_codes" ON promo_codes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update promo_codes" ON promo_codes
    FOR UPDATE USING (true);

-- Allow users to manage their own campaigns
CREATE POLICY "Users can manage own campaigns" ON campaigns
    FOR ALL USING (auth.uid() = created_by);

-- Allow users to manage promo codes for their campaigns
CREATE POLICY "Users can manage own promo_codes" ON promo_codes
    FOR ALL USING (
        campaign_id IN (
            SELECT id FROM campaigns WHERE created_by = auth.uid()
        )
    );