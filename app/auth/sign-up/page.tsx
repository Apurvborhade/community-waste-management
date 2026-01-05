import Link from "next/link"
import { Leaf } from "lucide-react"
import { SignUpForm } from "@/components/signup-form"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">EnvironmentTech</span>
          </Link>
          <p className="text-muted-foreground">Report waste. Improve your community.</p>
        </div>

        <SignUpForm />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">Already have an account?</span>
          </div>
        </div>

        <Link href="/auth/login" className="block text-center text-primary hover:underline text-sm font-medium">
          Sign in instead
        </Link>
      </div>
    </div>
  )
}
