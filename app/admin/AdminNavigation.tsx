"use client"

import { useRouter } from "next/navigation"
import { Leaf, User, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function AdminNavigation() {
  const router = useRouter()
  const supabase = createClient()

  // simple logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("userType")
    router.push("/")
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F7A20] rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-semibold text-gray-900">
                EnvironmentTech
              </span>
              <span className="text-gray-400 ml-2">— Admin Panel</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-full">
              <div className="w-8 h-8 bg-[#0F7A20] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Admin
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2 bg-[#0F7A20] text-white rounded-full hover:bg-[#0d6a1c] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

        </div>
      </div>
    </nav>
  )
}
