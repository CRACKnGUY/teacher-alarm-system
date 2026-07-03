import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECONDARY_PERIODS, PRIMARY_PERIODS, DAY_NAMES } from '@/hooks/useTimetable'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const structure = searchParams.get('structure') || 'secondary'
    const periods = structure === 'primary' ? PRIMARY_PERIODS : SECONDARY_PERIODS

    const supabase = await createClient()
    const today = DAY_NAMES[new Date().getDay()]
    const { data, error } = await supabase
      .from('slots')
      .select('*')
      .eq('day', today)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const slots = (data || []).reduce<Record<string, string>>((acc, s) => {
      acc[s.period_time] = s.subject
      return acc
    }, {} as Record<string, string>)

    const schedule = periods.map((p) => ({
      time: p.time,
      type: p.type,
      subject: slots[p.time] || null,
    }))

    return NextResponse.json({
      day: today,
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      structure,
      alarm: false,
      alarm_message: null,
      periods: schedule,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
