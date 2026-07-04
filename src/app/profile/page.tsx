'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { useTimetable, type Structure } from '@/hooks/useTimetable'

const options: { value: Structure; label: string; desc: string }[] = [
  { value: 'primary', label: 'Primary', desc: '8 periods — lunch at 12:10, break at 2:00' },
  { value: 'secondary', label: 'Middle-Higher Secondary', desc: '9 periods — lunch at 12:50, break at 2:40' },
]

export default function ProfilePage() {
  const { structure, setStructure } = useTimetable()

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Timetable Structure</h2>
        <p className="text-sm text-zinc-500">Choose the timetable layout that matches your school level.</p>
        <div className="flex flex-col gap-3 max-w-md">
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
    </DashboardLayout>
  )
}
