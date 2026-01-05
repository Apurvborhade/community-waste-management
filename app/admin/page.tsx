import { redirect } from "next/navigation"
import Link from "next/link"
import { Leaf, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { AdminReportsList } from "@/components/admin-reports-list"
import { cookies } from "next/headers"
async function checkIsAuthority(userId: string) {
  const cookieStore = await cookies() 
  const supabase = await createClient(cookieStore)
  const { data, error } = await supabase.from("profiles").select("is_authority").eq("id", userId).single()

  if (error || !data?.is_authority) {
    return false
  }

  return true
}

export default async function AdminPage() {
  // Check if user is authenticated
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is an authority
  const isAuthority = await checkIsAuthority(user.id)
  if (!isAuthority) {
    redirect("/reports")
  }

  const handleSignOut = async () => {
    "use server"
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    await supabase.auth.signOut()
    redirect("/")
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

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Authority Portal</span>
            <div className="w-px h-6 bg-border" />
            <form action={handleSignOut}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-2 mb-8">
          <h1 className="text-4xl font-bold">Authority Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and resolve waste reports from your community. Mark reports as resolved when action has been taken.
          </p>
        </div>

        <AdminReportsList />
      </main>
    </div>
  )
}
