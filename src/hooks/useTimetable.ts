'use client'

import { useState, useEffect } from 'react'

export type Slot = { id: string; day: string; periodTime: string; subject: string }

export const DEFAULT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const PERIODS = [
  { time: '9:20-10:00', type: 'period' },
  { time: '10:00-10:40', type: 'period' },
  { time: '10:40-10:50', type: 'break' },
  { time: '10:50-11:30', type: 'period' },
  { time: '11:30-12:10', type: 'period' },
  { time: '12:10-12:50', type: 'period' },
  { time: '12:50-1:20', type: 'lunch' },
  { time: '1:20-2:00', type: 'period' },
  { time: '2:00-2:40', type: 'period' },
  { time: '2:40-2:50', type: 'break' },
  { time: '2:50-3:30', type: 'period' },
  { time: '4:00-5:10', type: 'period' },
]

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const saved = localStorage.getItem(key)
    return saved ? (JSON.parse(saved) as T) : fallback
  } catch {
    return fallback
  }
}

export function useTimetable() {
  const [timetable, setTimetable] = useState<Slot[]>([])
  const [days, setDays] = useState<string[]>(DEFAULT_DAYS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setTimetable(loadFromStorage<Slot[]>('teacher_timetable', []))
    setDays(loadFromStorage<string[]>('teacher_days', DEFAULT_DAYS))
    setHydrated(true)
  }, [])

  const saveTimetable = (slots: Slot[]) => {
    setTimetable(slots)
    localStorage.setItem('teacher_timetable', JSON.stringify(slots))
  }

  const saveDays = (d: string[]) => {
    setDays(d)
    localStorage.setItem('teacher_days', JSON.stringify(d))
  }

  const addSlot = (slot: Omit<Slot, 'id'>) =>
    saveTimetable([...timetable, { id: genId(), ...slot }])

  const editSlot = (id: string, subject: string) =>
    saveTimetable(timetable.map((s) => (s.id === id ? { ...s, subject } : s)))

  const deleteSlot = (id: string) =>
    saveTimetable(timetable.filter((s) => s.id !== id))

  const addDay = (name: string) => {
    if (!name.trim()) return
    saveDays([...days, name.trim()])
  }

  const removeDay = (day: string) => {
    saveDays(days.filter((d) => d !== day))
    saveTimetable(timetable.filter((s) => s.day !== day))
  }

  const getSubject = (day: string, periodTime: string) =>
    timetable.find((s) => s.day === day && s.periodTime === periodTime)?.subject ?? ''

  return { timetable, days, addSlot, editSlot, deleteSlot, addDay, removeDay, getSubject, hydrated }
}
