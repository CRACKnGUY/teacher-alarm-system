'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Timetable',
    path: '/timetable',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Attendance',
    path: '#',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Alarms',
    path: '#',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    path: '#',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 bg-zinc-900 text-white flex flex-col shrink-0 border-r border-zinc-800">
      <div className="px-5 py-5 border-b border-zinc-800">
        <p className="font-semibold text-sm text-orange-500">Teacher System</p>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1">
        {navItems.map((item) =>
          item.path.startsWith('/') ? (
            <Link
              key={item.label}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.path
                  ? 'bg-orange-500/10 text-orange-500'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <button
              key={item.label}
              disabled
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-600 w-full text-left cursor-not-allowed"
              title="Coming soon"
            >
              {item.icon}
              {item.label}
            </button>
          ),
        )}
      </nav>

      <div className="border-t border-zinc-800 px-4 py-3 space-y-2">
        {user && (
          <p className="text-xs text-zinc-500 truncate" title={user.email}>
            {user.email}
          </p>
        )}
        <button
          onClick={handleSignOut}
          className="w-full text-left text-xs text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
