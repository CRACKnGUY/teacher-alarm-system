'use client'

import { useState, useRef, useEffect } from 'react'
import { useTimetable, PERIODS, DAY_NAMES } from '../hooks/useTimetable'

export default function TodaySchedule() {
  const { timetable, days, addSlot, editSlot, deleteSlot } = useTimetable()
  const today = DAY_NAMES[new Date().getDay()]
  const [editingCell, setEditingCell] = useState<{ day: string; periodTime: string } | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingCell) inputRef.current?.focus()
  }, [editingCell])

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

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Today — {today}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[900px]">
          <thead>
            <tr>
              <th className="border border-zinc-800 px-3 py-2 text-left font-medium text-zinc-500 text-xs uppercase tracking-wider w-16">
                Day
              </th>
              {PERIODS.map((period) => {
                const isFixed = period.type === 'break' || period.type === 'lunch'
                return (
                  <th
                    key={period.time}
                    className={`border border-zinc-800 px-2 py-2 text-center text-xs font-medium ${
                      isFixed ? 'text-zinc-600' : 'text-zinc-400'
                    } ${period.time === '10:40-10:50' || period.time === '12:50-1:20' || period.time === '2:40-2:50' ? 'bg-zinc-900/30' : ''}`}
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
              {PERIODS.map((period) => {
                const isFixed = period.type === 'break' || period.type === 'lunch'
                const fixedLabel = period.type === 'break' ? 'Break' : 'Lunch'
                const subject = getSubject(today, period.time)
                const isEditing = editingCell?.day === today && editingCell?.periodTime === period.time

                if (isFixed) {
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
                    className="border border-zinc-800 px-2 py-2 text-center cursor-pointer hover:bg-zinc-900/50 transition-colors min-w-[80px]"
                    onClick={() => {
                      setEditingCell({ day: today, periodTime: period.time })
                      setEditingValue(subject || '')
                    }}
                  >
                    {isEditing ? (
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
