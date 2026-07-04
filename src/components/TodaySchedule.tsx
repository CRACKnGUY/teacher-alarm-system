'use client'

import { useState, useRef, useEffect } from 'react'
import { useTimetable, DAY_NAMES } from '../hooks/useTimetable'
import { getCurrentPeriodIndex, parseTimeRange } from '@/lib/period-utils'

function fmt(n: number) { return n.toString().padStart(2, '0') }

export default function TodaySchedule() {
  const { timetable, days, periods, addSlot, editSlot, deleteSlot } = useTimetable()
  const today = DAY_NAMES[new Date().getDay()]
  const [editingCell, setEditingCell] = useState<{ day: string; periodTime: string } | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [now, setNow] = useState(new Date())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingCell) inputRef.current?.focus()
  }, [editingCell])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const currentIndex = getCurrentPeriodIndex(periods)
  const currentPeriod = currentIndex >= 0 ? periods[currentIndex] : null
  const currentSubject = currentPeriod && currentPeriod.type === 'period'
    ? timetable.find((s) => s.day === today && s.periodTime === currentPeriod.time)?.subject || ''
    : ''

  const hh = fmt(now.getHours())
  const mm = fmt(now.getMinutes())
  const ss = fmt(now.getSeconds())

  function getSubject(day: string, periodTime: string) {
    return timetable.find((s) => s.day === day && s.periodTime === periodTime)?.subject
  }

  function commitCell(day: string, periodTime: string) {
    const val = editingValue.trim()
    const existing = timetable.find((s) => s.day === day && s.periodTime === periodTime)
    if (!val) {
      if (existing) deleteSlot(existing.id)
    } else if (existing) {
      editSlot(existing.id, val)
    } else {
      addSlot({ day, periodTime, subject: val })
    }
    setEditingCell(null)
    setEditingValue('')
  }

  function isCurrentTime(periodTime: string) {
    const m = now.getHours() * 60 + now.getMinutes()
    const { start, end } = parseTimeRange(periodTime)
    return m >= start && m < end
  }

  const isFixed = (t: string) => t === 'break' || t === 'lunch'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Today — {today}</h2>
        <div className="font-mono text-2xl text-orange-500 tabular-nums">{hh}:{mm}:{ss}</div>
      </div>

      {currentSubject && (
        <div className="mb-4 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm text-orange-400">
          Now: <span className="font-semibold text-orange-300">{currentSubject}</span>
          {' '}&mdash; {currentPeriod?.time}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[900px]">
          <thead>
            <tr>
              <th className="border border-zinc-800 px-3 py-2 text-left font-medium text-zinc-500 text-xs uppercase tracking-wider w-16">
                Day
              </th>
              {periods.map((period) => {
                const fixed = isFixed(period.type)
                return (
                  <th
                    key={period.time}
                    className={`border border-zinc-800 px-2 py-2 text-center text-xs font-medium ${
                      fixed ? 'text-zinc-600' : 'text-zinc-400'
                    } ${isCurrentTime(period.time) ? 'bg-orange-500/15' : fixed ? 'bg-zinc-900/30' : ''}`}
                  >
                    {period.time}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-zinc-800 px-3 py-2 text-xs font-medium text-orange-500">
                {today}
              </td>
              {periods.map((period) => {
                const fixed = isFixed(period.type)
                const fixedLabel = period.type === 'break' ? 'Break' : 'Lunch'
                const subject = getSubject(today, period.time)
                const editing = editingCell?.day === today && editingCell?.periodTime === period.time

                if (fixed) {
                  return (
                    <td
                      key={period.time}
                      className={`border border-zinc-800 px-2 py-3 text-center text-xs italic ${
                        period.type === 'break' ? 'text-zinc-600' : 'text-zinc-500'
                      } bg-zinc-900/20`}
                    >
                      {fixedLabel}
                    </td>
                  )
                }

                return (
                  <td
                    key={period.time}
                    className={`border border-zinc-800 px-2 py-2 text-center cursor-pointer hover:bg-zinc-900/50 transition-colors min-w-[80px] ${
                      isCurrentTime(period.time) ? 'bg-orange-500/10' : ''
                    }`}
                    onClick={() => {
                      setEditingCell({ day: today, periodTime: period.time })
                      setEditingValue(subject || '')
                    }}
                  >
                    {editing ? (
                      <input
                        ref={inputRef}
                        className="w-full rounded border border-zinc-700 bg-zinc-900 px-1.5 py-1 text-xs text-white text-center outline-none focus:border-orange-500"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitCell(today, period.time)
                          if (e.key === 'Escape') { setEditingCell(null); setEditingValue('') }
                        }}
                        onBlur={() => commitCell(today, period.time)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Subject"
                        autoFocus
                      />
                    ) : (
                      <span className={`text-xs ${
                        subject ? 'text-white font-medium' : 'text-zinc-700'
                      }`}>
                        {subject || 'Free'}
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
