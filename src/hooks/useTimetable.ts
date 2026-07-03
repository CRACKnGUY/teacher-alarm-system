'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/index'

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
    loadFromSupabase()
  }, [])

  async function loadFromSupabase() {
    const { data, error } = await supabase.from('slots').select('*')
    if (error || !data || data.length === 0) {
      const cached = loadFromStorage<Slot[]>('teacher_timetable', [])
      setTimetable(cached)
    } else {
      const converted: Slot[] = data.map((s) => ({
        id: s.id,
        day: s.day,
        periodTime: s.period_time,
        subject: s.subject,
      }))
      setTimetable(converted)
      localStorage.setItem('teacher_timetable', JSON.stringify(converted))
    }
    setDays(loadFromStorage<string[]>('teacher_days', DEFAULT_DAYS))
    setHydrated(true)
  }

  async function syncSlot(slot: Slot) {
    const { error } = await supabase.from('slots').upsert(
      {
        day: slot.day,
        period_time: slot.periodTime,
        subject: slot.subject,
      },
      { onConflict: 'day,period_time', ignoreDuplicates: false },
    )
    if (error) console.error('Supabase sync error:', error.message)
  }

  async function deleteSlotFromSupabase(day: string, periodTime: string) {
    const { error } = await supabase
      .from('slots')
      .delete()
      .eq('day', day)
      .eq('period_time', periodTime)
    if (error) console.error('Supabase delete error:', error.message)
  }

  const saveTimetable = (slots: Slot[]) => {
    setTimetable(slots)
    localStorage.setItem('teacher_timetable', JSON.stringify(slots))
  }

  const saveDays = (d: string[]) => {
    setDays(d)
    localStorage.setItem('teacher_days', JSON.stringify(d))
  }

  const addSlot = (slot: Omit<Slot, 'id'>) => {
    const newSlots = [...timetable, { id: genId(), ...slot }]
    saveTimetable(newSlots)
    syncSlot({ id: genId(), ...slot })
  }

  const editSlot = (id: string, subject: string) => {
    const slot = timetable.find((s) => s.id === id)
    const newSlots = timetable.map((s) => (s.id === id ? { ...s, subject } : s))
    saveTimetable(newSlots)
    if (slot) syncSlot({ ...slot, subject })
  }

  const deleteSlot = (id: string) => {
    const slot = timetable.find((s) => s.id === id)
    saveTimetable(timetable.filter((s) => s.id !== id))
    if (slot) deleteSlotFromSupabase(slot.day, slot.periodTime)
  }

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
