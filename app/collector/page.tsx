"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Leaf, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export default function CollectorPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
      }

      // Check if user type is collector
      const userType = localStorage.getItem("userType")
      if (userType !== "collector") {
        router.push("/reports")
      }
    }

    checkAuth()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("userType")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Garbage Collector Dashboard</h1>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Garbage Collector!</CardTitle>
            <CardDescription>Your dashboard is under construction</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page will soon display waste collection routes, assigned reports, and collection statistics.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
