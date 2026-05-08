"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { motion } from "framer-motion"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Link as LinkIcon } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const data = await apiClient.post<any>("/auth/login", { email, password })
      localStorage.setItem("accessToken", data.accessToken)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen dot-grid-bg flex flex-col">
      <nav className="w-full px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer">
            <LinkIcon size={16} strokeWidth={1.5} />
            <span className="text-xs font-mono tracking-[0.15em] uppercase font-bold">
              SHORT.LY
            </span>
          </div>
        </Link>
        <ThemeToggle />
      </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md border border-foreground/20 bg-background/80 backdrop-blur-sm p-8"
        >
          <div className="mb-8">
            <h1 className="font-pixel text-3xl mb-2">ACCESS</h1>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Authenticate to your terminal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 text-xs font-mono">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-foreground/20 p-3 text-sm font-mono focus:outline-none focus:border-foreground transition-colors"
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-foreground/20 p-3 text-sm font-mono focus:outline-none focus:border-foreground transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-foreground text-background py-3 text-xs font-mono uppercase tracking-widest mt-6 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? "Authenticating..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-mono text-muted-foreground">
            NO ACCOUNT?{" "}
            <Link href="/register" className="text-foreground hover:underline">
              REGISTER HERE
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
