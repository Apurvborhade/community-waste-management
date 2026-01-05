import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Leaf, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ReportsList } from "@/components/reports-list"
import { cookies } from "next/headers"
import SignOutButton from "@/components/SignOutButton"

export default async function ReportsPage() {
  // Check if user is authenticated
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-semibold">EnvironmentTech</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/report">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Report Waste
              </Button>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-2 mb-8">
          <h1 className="text-4xl font-bold">Community Waste Reports</h1>
          <p className="text-muted-foreground">
            View reported waste hotspots in your community. Help track and resolve environmental issues.
          </p>
        </div>

        <ReportsList />
      </main>
    </div>
  )
}
