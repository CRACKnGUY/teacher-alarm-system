'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useTimetable, type Structure } from '@/hooks/useTimetable'
import { createClient } from '@/lib/supabase/client'

const options: { value: Structure; label: string; desc: string }[] = [
  { value: 'primary', label: 'Primary', desc: '8 periods — lunch at 12:10, break at 2:00' },
  { value: 'secondary', label: 'Middle-Higher Secondary', desc: '9 periods — lunch at 12:50, break at 2:40' },
]

export default function ProfilePage() {
  const { structure, setStructure } = useTimetable()
  const [name, setName] = useState('')
  const [grades, setGrades] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('name, grades')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setName(data.name || '')
        setGrades(data.grades || '')
      }
      setLoaded(true)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    setSaved(false)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('profiles').upsert(
      { id: user.id, name, grades, updated_at: new Date().toISOString() },
      { onConflict: 'id' },
    )
    if (error) {
      console.error('Profile save error:', error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  if (!loaded) {
    return (
      <DashboardLayout>
        <div className="text-zinc-500 text-sm">Loading profile...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md">
        {/* Name & Class */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Teacher Info</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Name</label>
              <input
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500 transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Grades you handle</label>
              <input
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500 transition-colors"
                value={grades}
                onChange={(e) => setGrades(e.target.value)}
                placeholder="e.g. X-XII"
              />
            </div>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400 transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>

        {/* Structure */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Timetable Structure</h2>
          <p className="text-sm text-zinc-500 mb-3">Choose the timetable layout that matches your school level.</p>
          <div className="flex flex-col gap-3">
            {options.map((opt) => {
              const active = structure === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setStructure(opt.value)}
                  className={`text-left rounded-lg border px-4 py-3 transition-colors cursor-pointer ${
                    active
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                  }`}
                >
                  <p className={`text-sm font-medium ${active ? 'text-orange-500' : 'text-white'}`}>{opt.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
