import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const now = new Date().toISOString()

    // Clean expired
    await supabase.from('alarm_events').delete().lt('expires_at', now)

    const { data, error } = await supabase
      .from('alarm_events')
      .select('*')
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ active: false })
    }

    return NextResponse.json({
      active: true,
      id: data[0].id,
      subject: data[0].subject,
      day: data[0].day,
      period_time: data[0].period_time,
      expires_at: data[0].expires_at,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
