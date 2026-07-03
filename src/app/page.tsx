'use client'

import { useRouter } from 'next/navigation'

export default function Welcome() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome</h1>
        <p className="text-zinc-400 mb-8">Teacher Schedule System</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-3 rounded-lg transition-colors cursor-pointer"
        >
          Get Started
        </button>
      </div>
    </div>
  )
}
