"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [userType, setUserType] = useState<"normal" | "collector" | "admin">("normal")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const message = error.message || "Unable to sign in. Please try again."

        // If the user hasn't confirmed their email yet, show a specific prompt
        const isUnverified =
          message.toLowerCase().includes("confirm") || message.toLowerCase().includes("not confirmed")

        toast({
          title: isUnverified ? "Please Verify Your Email" : "Login Failed",
          description: isUnverified
            ? "You need to confirm your email address before signing in. Please check your inbox for the verification link."
            : message,
          variant: "destructive",
        })
      } else {
        // Store user type in localStorage
        localStorage.setItem("userType", userType)
        
        toast({
          title: "Welcome Back!",
          description: "You've successfully logged in.",
        })
        
        // Redirect based on user type
        if (userType === "normal") {
          router.push("/reports")
        } else if (userType === "collector") {
          router.push("/collector")
        } else if (userType === "admin") {
          router.push("/admin")
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your email and password to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userType">User Type</Label>
            <Select value={userType} onValueChange={(value) => setUserType(value as "normal" | "collector" | "admin")} disabled={isLoading}>
              <SelectTrigger id="userType">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal User</SelectItem>
                <SelectItem value="collector">Garbage Collector</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Spinner className="mr-2 h-4 w-4" />}
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-4">
          Don't have an account?{" "}
          <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
