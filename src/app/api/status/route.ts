import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Slot } from '@/lib/supabase'
import { PERIODS, DAY_NAMES } from '@/hooks/useTimetable'

export async function GET() {
  try {
    const today = DAY_NAMES[new Date().getDay()]
    const { data, error } = await supabase
      .from('slots')
      .select('*')
      .eq('day', today)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const slots = (data as Slot[] || []).reduce<Record<string, string>>((acc, s) => {
      acc[s.period_time] = s.subject
      return acc
    }, {} as Record<string, string>)

    const schedule = PERIODS.map((p) => ({
      time: p.time,
      type: p.type,
      subject: slots[p.time] || null,
    }))

    return NextResponse.json({ day: today, schedule })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
