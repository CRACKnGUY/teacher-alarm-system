'use client'

import { useTimetable, PERIODS, DAY_NAMES } from '../hooks/useTimetable'

export default function TodaySchedule() {
  const { getSubject } = useTimetable()
  const today = DAY_NAMES[new Date().getDay()]

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

                const subject = getSubject(today, period.time)
                return (
                  <td
                    key={period.time}
                    className="border border-zinc-800 px-2 py-2 text-center text-xs min-w-[80px]"
                  >
                    <span className={subject ? 'text-white font-medium' : 'text-zinc-700'}>
                      {subject || 'Free'}
                    </span>
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
