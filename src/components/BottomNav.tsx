'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Timetable', path: '/timetable' },
  { label: 'Attendance', path: '/attendance' },
  { label: 'Profile', path: '/profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800">
      <div className="flex">
        {navItems.map((item) => {
          const active = pathname === item.path
          return (
            <Link
              key={item.label}
              href={item.path}
              className={`flex-1 flex flex-col items-center py-2 text-[10px] font-medium transition-colors ${
                active
                  ? 'text-orange-500'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
