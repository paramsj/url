"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { LayoutDashboard, Link as LinkIcon, LogOut, BarChart3, Plus } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    router.push("/login")
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen dot-grid-bg flex items-center justify-center font-mono">LOADING TERMINAL...</div>
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Links", href: "/dashboard/links", icon: LinkIcon },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full md:w-64 border-r border-foreground/10 bg-background/50 flex flex-col"
      >
        <div className="p-6 border-b border-foreground/10 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <LinkIcon size={16} strokeWidth={1.5} />
              <span className="text-xs font-mono tracking-[0.15em] uppercase font-bold">
                SHORT.LY
              </span>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-mono tracking-wider uppercase transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  <item.icon size={16} />
                  {item.name}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-foreground/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-mono tracking-wider uppercase text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto dot-grid-bg">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
