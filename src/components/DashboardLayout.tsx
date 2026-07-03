'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: "Today's schedule at a glance" },
  '/timetable': { title: 'Timetable', subtitle: 'Edit your weekly schedule' },
  '/profile': { title: 'Profile', subtitle: 'Manage your preferences' },
  '/attendance': { title: 'Attendance', subtitle: 'View attendance records' },
  '/alarms': { title: 'Alarms', subtitle: 'Configure alarm settings' },
}

interface Props {
  children: ReactNode
}

export default function DashboardLayout({ children }: Props) {
  const pathname = usePathname()
  const info = pageTitles[pathname] || { title: 'Dashboard', subtitle: '' }

  return (
    <div className="min-h-screen flex bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b border-zinc-800 px-8 py-4">
          <h1 className="text-xl font-semibold text-white">{info.title}</h1>
          <p className="text-sm text-zinc-500">{info.subtitle}</p>
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
