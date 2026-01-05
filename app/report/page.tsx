
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Leaf } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ReportForm } from "@/components/report-form"
import { cookies } from "next/headers"

export default async function ReportPage() {
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
          <Link href="/reports" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-semibold">EnvironmentTech</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <ReportForm />
      </main>
    </div>
  )
}
