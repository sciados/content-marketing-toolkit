-- supabase/migrations/004_usage_tracking_simple.sql
-- Simple usage tracking system without complex functions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing functions if they exist (but keep update_updated_at_column)
DROP FUNCTION IF EXISTS check_usage_limit(UUID, TEXT);
DROP FUNCTION IF EXISTS update_usage_tracking(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_user_usage_stats(UUID);

-- Drop the usage tracking table if it exists (since it has no data)
DROP TABLE IF EXISTS usage_tracking CASCADE;

-- Create usage_tracking table fresh
-- Create usage_tracking table fresh
CREATE TABLE usage_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- First day of the month
    emails_generated INTEGER DEFAULT 0,
    emails_saved INTEGER DEFAULT 0,
    ai_tokens_used INTEGER DEFAULT 0,
    series_created INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per user per month
    UNIQUE(user_id, month)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month ON usage_tracking(month);

-- Enable RLS
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own usage" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON usage_tracking
    FOR UPDATE USING (auth.uid() = user_id);

-- Simple function to check usage limits (basic version)
CREATE OR REPLACE FUNCTION check_usage_limit(p_user_id UUID, p_limit_type TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS '
DECLARE
    current_month DATE;
    current_count INTEGER := 0;
    tier_limit INTEGER := -1;
    user_tier TEXT := ''free'';
    result JSON;
BEGIN
    current_month := DATE_TRUNC(''month'', NOW())::DATE;
    
    -- Get user tier
    SELECT subscription_tier INTO user_tier FROM profiles WHERE id = p_user_id;
    IF user_tier IS NULL THEN user_tier := ''free''; END IF;
    
    -- Get tier limits
    IF p_limit_type = ''emails'' THEN
        SELECT email_quota INTO tier_limit FROM subscription_tiers WHERE name = user_tier;
    ELSIF p_limit_type = ''series'' THEN
        SELECT series_limit INTO tier_limit FROM subscription_tiers WHERE name = user_tier;
    ELSIF p_limit_type = ''ai_tokens'' THEN
        SELECT ai_tokens_monthly INTO tier_limit FROM subscription_tiers WHERE name = user_tier;
    END IF;
    
    -- Get current usage
    IF p_limit_type = ''emails'' THEN
        SELECT COALESCE(emails_generated, 0) INTO current_count FROM usage_tracking WHERE user_id = p_user_id AND month = current_month;
    ELSIF p_limit_type = ''series'' THEN
        SELECT COALESCE(series_created, 0) INTO current_count FROM usage_tracking WHERE user_id = p_user_id AND month = current_month;
    ELSIF p_limit_type = ''ai_tokens'' THEN
        SELECT COALESCE(ai_tokens_used, 0) INTO current_count FROM usage_tracking WHERE user_id = p_user_id AND month = current_month;
    END IF;
    
    IF current_count IS NULL THEN current_count := 0; END IF;
    IF tier_limit IS NULL THEN tier_limit := 0; END IF;
    
    -- Build result JSON
    result := json_build_object(
        ''allowed'', (tier_limit = -1 OR current_count < tier_limit),
        ''current_usage'', current_count,
        ''limit_value'', tier_limit,
        ''remaining'', CASE WHEN tier_limit = -1 THEN -1 ELSE GREATEST(0, tier_limit - current_count) END
    );
    
    RETURN result;
END;
';

-- Simple function to update usage tracking
CREATE OR REPLACE FUNCTION update_usage_tracking(p_user_id UUID, p_usage_type TEXT, p_amount INTEGER DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS '
DECLARE
    current_month DATE;
BEGIN
    current_month := DATE_TRUNC(''month'', NOW())::DATE;
    
    -- Insert or update usage record
    IF p_usage_type = ''emails_generated'' THEN
        INSERT INTO usage_tracking (user_id, month, emails_generated) VALUES (p_user_id, current_month, p_amount)
        ON CONFLICT (user_id, month) DO UPDATE SET emails_generated = usage_tracking.emails_generated + p_amount, updated_at = NOW();
    ELSIF p_usage_type = ''emails_saved'' THEN
        INSERT INTO usage_tracking (user_id, month, emails_saved) VALUES (p_user_id, current_month, p_amount)
        ON CONFLICT (user_id, month) DO UPDATE SET emails_saved = usage_tracking.emails_saved + p_amount, updated_at = NOW();
    ELSIF p_usage_type = ''ai_tokens_used'' THEN
        INSERT INTO usage_tracking (user_id, month, ai_tokens_used) VALUES (p_user_id, current_month, p_amount)
        ON CONFLICT (user_id, month) DO UPDATE SET ai_tokens_used = usage_tracking.ai_tokens_used + p_amount, updated_at = NOW();
    ELSIF p_usage_type = ''series_created'' THEN
        INSERT INTO usage_tracking (user_id, month, series_created) VALUES (p_user_id, current_month, p_amount)
        ON CONFLICT (user_id, month) DO UPDATE SET series_created = usage_tracking.series_created + p_amount, updated_at = NOW();
    END IF;
END;
';

-- Create trigger to update updated_at timestamp (reuse existing function)
CREATE TRIGGER update_usage_tracking_updated_at
    BEFORE UPDATE ON usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON usage_tracking TO authenticated;
GRANT EXECUTE ON FUNCTION check_usage_limit(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_usage_tracking(UUID, TEXT, INTEGER) TO authenticated;

-- Insert sample usage data for your current user
INSERT INTO usage_tracking (user_id, month, emails_generated, emails_saved, ai_tokens_used, series_created)
SELECT 
    auth.uid(),
    DATE_TRUNC('month', NOW())::DATE,
    4,
    4,
    150,
    1
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, month) DO UPDATE SET
    emails_generated = 4,
    emails_saved = 4,
    ai_tokens_used = 150,
    series_created = 1,
    updated_at = NOW();