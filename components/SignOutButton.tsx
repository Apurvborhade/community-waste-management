"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  const router = useRouter()

  React.useEffect(() => {
    // Optionally, you can check authentication status here using client-side Supabase
    // and redirect if not logged in. Here we just allow button to show.
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem("userType")
    router.push("/")
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center w-full text-sm"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Sign Out</span>
    </button>
  )
}