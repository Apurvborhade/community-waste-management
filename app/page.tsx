import Link from "next/link"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Leaf, MapPin, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function LandingPage() {
  // If the user is already authenticated, skip the landing/sign-in UI
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/reports")
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">EnvironmentTech</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Join Now</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 bg-gradient-to-b from-background to-secondary/5">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">
            Report Waste. <span className="text-primary">Improve Your Community.</span>
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            Help keep your neighborhood clean and healthy. Report waste hotspots and connect with community members and
            authorities to drive real environmental change.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/auth/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                Report Waste Now
              </Button>
            </Link>
            <Link href="/reports">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                View Reports
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Spot & Report</h3>
              <p className="text-muted-foreground">
                Take a photo of waste hotspots in your area. Our app automatically captures your location.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Share with Community</h3>
              <p className="text-muted-foreground">
                Your report is visible to other community members and local authorities.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Drive Change</h3>
              <p className="text-muted-foreground">
                Track resolutions and celebrate community wins. Together, we keep our neighborhoods clean.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Make a Difference?</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of community members taking action against waste in their neighborhoods.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg">Get Started Today</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground gap-4">
          <p>&copy; 2025 EnvironmentTech. Building cleaner communities together.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
