'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useTimetable, DAY_NAMES } from '@/hooks/useTimetable'

export default function AlarmsPage() {
  const { timetable, periods } = useTimetable()
  const today = DAY_NAMES[new Date().getDay()]
  const [ringing, setRinging] = useState<string | null>(null)

  function getSubject(periodTime: string) {
    return timetable.find((s) => s.day === today && s.periodTime === periodTime)?.subject
  }

  async function triggerAlarm(subject: string, periodTime: string) {
    setRinging(periodTime)
    try {
      await fetch('/api/alarms/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, day: today, period_time: periodTime }),
      })
    } catch {
      // silent
    }
    setTimeout(() => setRinging(null), 10000)
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-4">
        <h2 className="text-lg font-semibold text-white">{today}</h2>

        {periods.map((period) => {
          const isFixed = period.type === 'break' || period.type === 'lunch'
          const subject = getSubject(period.time)

          if (isFixed) return null

          return (
            <div
              key={period.time}
              className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
            >
              <div className="w-24 shrink-0 text-xs font-mono text-zinc-500">{period.time}</div>
              <div className="flex-1 text-sm text-white font-medium">{subject || <span className="text-zinc-700 font-normal">Free</span>}</div>
              <button
                disabled={!subject || ringing === period.time}
                onClick={() => triggerAlarm(subject!, period.time)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  ringing === period.time
                    ? 'bg-orange-500/30 text-orange-300 animate-pulse'
                    : subject
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                {ringing === period.time ? 'Ringing...' : 'Ring Alarm'}
              </button>
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
