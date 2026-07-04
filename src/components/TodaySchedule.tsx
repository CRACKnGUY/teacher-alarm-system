'use client'

import { useState, useRef, useEffect } from 'react'
import { useTimetable, DAY_NAMES } from '../hooks/useTimetable'
import { getCurrentPeriodIndex, parseTimeRange } from '@/lib/period-utils'

export default function TodaySchedule() {
  const { timetable, periods, addSlot, editSlot, deleteSlot } = useTimetable()
  const today = DAY_NAMES[new Date().getDay()]
  const [editingCell, setEditingCell] = useState<{ periodTime: string } | null>(null)
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

  // 12-hour clock
  const h12 = ((now.getHours() + 11) % 12) + 1
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM'
  const clock = `${h12}:${fmt(now.getMinutes())}:${fmt(now.getSeconds())} ${ampm}`

  // Escalation
  const minsElapsed = currentPeriod && currentPeriod.type === 'period' && currentSubject
    ? now.getHours() * 60 + now.getMinutes() - parseTimeRange(currentPeriod.time).start
    : -1

  let alarmLevel: 'none' | 'active' | 'late' | 'escalated' = 'none'
  if (currentPeriod && currentPeriod.type === 'period' && currentSubject) {
    if (minsElapsed >= 10) alarmLevel = 'escalated'
    else if (minsElapsed >= 5) alarmLevel = 'late'
    else if (minsElapsed >= 0) alarmLevel = 'active'
  }

  function fmt(n: number) { return n.toString().padStart(2, '0') }

  function getSubject(periodTime: string) {
    return timetable.find((s) => s.day === today && s.periodTime === periodTime)?.subject
  }

  function commitCell(periodTime: string) {
    const val = editingValue.trim()
    const existing = timetable.find((s) => s.day === today && s.periodTime === periodTime)
    if (!val) {
      if (existing) deleteSlot(existing.id)
    } else if (existing) {
      editSlot(existing.id, val)
    } else {
      addSlot({ day: today, periodTime, subject: val })
    }
    setEditingCell(null)
    setEditingValue('')
  }

  function isCurrent(periodTime: string) {
    const m = now.getHours() * 60 + now.getMinutes()
    const { start, end } = parseTimeRange(periodTime)
    return m >= start && m < end
  }

  function statusLabel(period: { time: string; type: string }, subject: string | undefined) {
    if (period.type === 'break') return 'Break'
    if (period.type === 'lunch') return 'Lunch'
    return subject || 'Free'
  }

  const alertColors: Record<string, string> = {
    active: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    late: 'border-red-500/30 bg-red-500/10 text-red-400',
    escalated: 'border-red-600/40 bg-red-600/20 text-red-300',
  }

  const alertLabels: Record<string, string> = {
    active: 'Now',
    late: 'Late',
    escalated: 'Escalated',
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white">{today}</h2>
        <div className="font-mono text-xl text-orange-500 tabular-nums">{clock}</div>
      </div>

      {/* Escalation alert */}
      {alarmLevel !== 'none' && (
        <div className={`mb-4 rounded-lg border px-4 py-2.5 text-sm text-center ${alertColors[alarmLevel]}`}>
          <span className="font-semibold">{alertLabels[alarmLevel]}:</span>
          {' '}{currentSubject} &mdash; {currentPeriod?.time}
          {alarmLevel === 'late' && <span className="block text-xs mt-0.5 opacity-80">Teacher hasn&apos;t scanned RFID yet</span>}
          {alarmLevel === 'escalated' && <span className="block text-xs mt-0.5 opacity-80">Office has been notified</span>}
        </div>
      )}

      {/* Active period info */}
      {currentSubject && alarmLevel === 'active' && (
        <div className="mb-4 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm text-orange-400 text-center">
          <span className="font-semibold text-orange-300">{currentSubject}</span>
          &nbsp;&mdash;&nbsp;{currentPeriod?.time}
        </div>
      )}

      {/* Period list */}
      <div className="space-y-1">
        {periods.map((period) => {
          const active = isCurrent(period.time)
          const subject = getSubject(period.time)
          const isFixed = period.type === 'break' || period.type === 'lunch'
          const editing = editingCell?.periodTime === period.time

          return (
            <div
              key={period.time}
              className={`flex items-center rounded-lg border transition-colors ${
                active
                  ? alarmLevel === 'escalated'
                    ? 'border-red-600/40 bg-red-600/15'
                    : alarmLevel === 'late'
                      ? 'border-red-500/30 bg-red-500/10'
                      : 'border-orange-500/40 bg-orange-500/10'
                  : 'border-zinc-800 bg-zinc-900/50'
              } ${editing ? '' : 'cursor-pointer hover:border-zinc-700'}`}
              onClick={() => {
                if (!isFixed && !editing) {
                  setEditingCell({ periodTime: period.time })
                  setEditingValue(subject || '')
                }
              }}
            >
              <div className={`w-24 shrink-0 px-3 py-2.5 text-xs font-mono ${
                active ? 'text-orange-400' : 'text-zinc-500'
              }`}>
                {period.time}
              </div>
              <div className="flex-1 px-3 py-2.5 text-xs">
                {editing ? (
                  <input
                    ref={inputRef}
                    className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-white outline-none focus:border-orange-500"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitCell(period.time)
                      if (e.key === 'Escape') { setEditingCell(null); setEditingValue('') }
                    }}
                    onBlur={() => commitCell(period.time)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Subject"
                    autoFocus
                  />
                ) : (
                  <span className={
                    isFixed
                      ? 'italic text-zinc-600'
                      : subject
                        ? 'text-white font-medium'
                        : 'text-zinc-700'
                  }>
                    {statusLabel(period, subject)}
                  </span>
                )}
              </div>
              <div className="w-6 shrink-0 pr-3 text-right">
                {period.type === 'period' && subject && (
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                    active && alarmLevel !== 'escalated' ? 'bg-orange-500' : active && alarmLevel === 'late' ? 'bg-red-500' : active && alarmLevel === 'escalated' ? 'bg-red-600' : 'bg-zinc-700'
                  }`} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
