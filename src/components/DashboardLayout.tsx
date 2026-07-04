'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

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
      <div className="flex-1 flex flex-col pb-16 md:pb-0">
        <header className="border-b border-zinc-800 px-4 md:px-8 py-4">
          <h1 className="text-lg md:text-xl font-semibold text-white">{info.title}</h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">{info.subtitle}</p>
        </header>
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
