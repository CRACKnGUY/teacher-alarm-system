import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
