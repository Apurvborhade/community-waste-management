"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()

  React.useEffect(() => {
    // Optionally, you can check authentication status here using client-side Supabase
    // and redirect if not logged in. Here we just allow button to show.
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      Sign Out
    </button>
  )
}