import { createClient } from '@supabase/supabase-js'

function getEnv() {
  if (typeof window !== 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    }
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return { url, key }
}

export function getSupabaseClient() {
  const { url, key } = getEnv()
  return createClient(url, key)
}

export const supabase = getSupabaseClient()

export type Slot = {
  id: string
  day: string
  period_time: string
  subject: string
  created_at?: string
  updated_at?: string
}

export type Attendance = {
  id: string
  uid: string
  scanned_at: string
  day: string
  period_time: string
}

export type Alarm = {
  id: string
  day: string
  period_time: string
  enabled: boolean
  created_at?: string
}
