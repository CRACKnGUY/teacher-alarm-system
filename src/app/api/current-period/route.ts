import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECONDARY_PERIODS, PRIMARY_PERIODS, DAY_NAMES } from '@/hooks/useTimetable'
import { getCurrentPeriodIndex, parseTimeRange } from '@/lib/period-utils'

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

    const index = getCurrentPeriodIndex(periods)
    const currentPeriod = index >= 0 ? periods[index] : null
    const subject = currentPeriod && currentPeriod.type === 'period' ? (slots[currentPeriod.time] || '') : ''

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const elapsed = currentPeriod ? currentMinutes - parseTimeRange(currentPeriod.time).start : 0

    return NextResponse.json({
      day: today,
      server_time: now.toLocaleTimeString('en-US', { hour12: false }),
      period_index: index,
      period_time: currentPeriod?.time || null,
      period_type: currentPeriod?.type || null,
      subject: subject || null,
      is_active: index >= 0,
      subject_assigned: !!subject,
      elapsed_minutes: elapsed,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
