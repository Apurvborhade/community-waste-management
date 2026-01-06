import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Leaf, Plus, User, LogOut, Settings } from "lucide-react"
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

  // Get user's resolved reports count
  const { count: resolvedCount } = await supabase
    .from("waste_reports")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "resolved")

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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-background text-primary border-2 border-primary">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">My Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground pt-1">
                      Contributions: {resolvedCount || 0} resolved
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <div className="cursor-pointer">
                    <SignOutButton />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
