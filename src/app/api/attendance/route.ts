import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DAY_NAMES, PERIODS } from '@/hooks/useTimetable'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { uid } = body

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
    }

    const now = new Date()
    const day = DAY_NAMES[now.getDay()]
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const currentPeriod = PERIODS.find((p) => {
      const [start, end] = p.time.split('-')
      const [sh, sm] = start.split(':').map(Number)
      const [eh, em] = end.split(':').map(Number)
      const startMins = sh * 60 + sm
      const endMins = eh * 60 + em
      return currentMinutes >= startMins && currentMinutes < endMins
    })

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        uid,
        day,
        period_time: currentPeriod?.time || 'unknown',
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, record: data?.[0] || null })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
