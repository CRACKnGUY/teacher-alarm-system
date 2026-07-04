import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { subject, day, period_time } = await request.json()
    if (!subject) {
      return NextResponse.json({ error: 'subject is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 10000).toISOString()

    const { data, error } = await supabase
      .from('alarm_events')
      .insert({ subject, day: day || '', period_time: period_time || '', expires_at: expiresAt })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
