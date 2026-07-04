'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const REVIEWED_PREFIX = 'daily_reviewed_'

export function useDailySchedule(date: string) {
  const [dailySubjects, setDailySubjects] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)
  const [exists, setExists] = useState(false)

  useEffect(() => {
    const locallyReviewed = localStorage.getItem(REVIEWED_PREFIX + date)
    if (locallyReviewed) {
      setExists(true)
      setLoading(false)
      return
    }

    let cancelled = false
    async function fetch() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return

      const { data } = await supabase
        .from('daily_schedules')
        .select('periods')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle()

      if (!cancelled) {
        if (data) {
          const map: Record<string, string> = {}
          for (const p of (data.periods as { periodTime: string; subject: string }[])) {
            map[p.periodTime] = p.subject
          }
          setDailySubjects(map)
          setExists(true)
          localStorage.setItem(REVIEWED_PREFIX + date, 'true')
        }
        setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [date])

  const save = useCallback(async (subjects: Record<string, string>) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const periods = Object.entries(subjects).map(([periodTime, subject]) => ({ periodTime, subject }))

    const { error } = await supabase.from('daily_schedules').upsert(
      { user_id: user.id, date, periods, reviewed_at: new Date().toISOString() },
      { onConflict: 'user_id,date' },
    )
    if (error) console.error('Daily schedule save error:', error.message)

    setDailySubjects(subjects)
    setExists(true)
    localStorage.setItem(REVIEWED_PREFIX + date, 'true')
  }, [date])

  return { dailySubjects, loading, exists, save }
}
