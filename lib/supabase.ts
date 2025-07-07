import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export type Campaign = {
  id: string
  admin_key: string
  created_by?: string
  created_at: string
  expires_at?: string
}

export type PromoCode = {
  id: string
  campaign_id: string
  value: string
  claimed_by?: string
  claimed_at?: string
}