"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { motion } from "framer-motion"
import { Plus, Link as LinkIcon, MousePointerClick, Activity, Clock, AlertTriangle, Infinity as InfinityIcon } from "lucide-react"
import Link from "next/link"

interface ShortLink {
  id: string
  originalUrl: string
  shortCode: string
  totalClicks: number
  createdAt: string
  expiresAt?: string | null
  isActive: boolean
}

export default function DashboardPage() {
  const [links, setLinks] = useState<ShortLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Create link form state
  const [originalUrl, setOriginalUrl] = useState("")
  const [title, setTitle] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const data = await apiClient.get<ShortLink[]>("/links")
      setLinks(data || [])
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError("")
    setIsCreating(true)

    try {
      const payload: any = { originalUrl, title }
      if (expiresAt) {
        payload.expiresAt = new Date(expiresAt).toISOString()
      }
      
      await apiClient.post("/links", payload)
      setOriginalUrl("")
      setTitle("")
      setExpiresAt("")
      fetchLinks() // Refresh list
    } catch (err: any) {
      setCreateError(err.message || "Failed to create link")
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) return <div className="font-mono text-sm">LOADING METRICS...</div>

  const now = new Date()
  
  const activeLinks = links.filter(link => {
    const expired = link.expiresAt && new Date(link.expiresAt) < now
    return link.isActive && !expired
  }).length

  const expiredLinks = links.filter(link => {
    return link.expiresAt && new Date(link.expiresAt) < now
  }).length

  const neverExpiringLinks = links.filter(link => !link.expiresAt).length
  
  const totalClicks = links.reduce((acc, link) => acc + (link.totalClicks || 0), 0)
  
  const recentLinks = [...links].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-pixel text-4xl mb-2">SYSTEM OVERVIEW</h1>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Real-time metrics and routing status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-foreground/20 bg-background/50 backdrop-blur-sm p-6"
        >
          <div className="flex items-center justify-between mb-4 text-muted-foreground">
            <span className="text-xs font-mono uppercase tracking-widest">Active Routes</span>
            <Activity size={16} className="text-green-500" />
          </div>
          <div className="text-4xl font-pixel text-green-500">{activeLinks}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-foreground/20 bg-background/50 backdrop-blur-sm p-6"
        >
          <div className="flex items-center justify-between mb-4 text-muted-foreground">
            <span className="text-xs font-mono uppercase tracking-widest">Expired Routes</span>
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div className="text-4xl font-pixel text-red-500">{expiredLinks}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-foreground/20 bg-background/50 backdrop-blur-sm p-6"
        >
          <div className="flex items-center justify-between mb-4 text-muted-foreground">
            <span className="text-xs font-mono uppercase tracking-widest">Never Expires</span>
            <InfinityIcon size={16} className="text-blue-500" />
          </div>
          <div className="text-4xl font-pixel text-blue-500">{neverExpiringLinks}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-foreground/20 bg-background/50 backdrop-blur-sm p-6"
        >
          <div className="flex items-center justify-between mb-4 text-muted-foreground">
            <span className="text-xs font-mono uppercase tracking-widest">Total Events</span>
            <MousePointerClick size={16} />
          </div>
          <div className="text-4xl font-pixel">{totalClicks}</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Link Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1 border border-foreground/20 bg-background/80 p-6 h-fit"
        >
          <h2 className="font-mono font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
            <Plus size={16} /> Deploy New Route
          </h2>
          <form onSubmit={handleCreateLink} className="space-y-4">
            {createError && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 text-xs font-mono">
                {createError}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-muted-foreground">Target URL</label>
              <input
                type="url"
                required
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/long-url"
                className="w-full bg-transparent border border-foreground/20 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-muted-foreground">Alias (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Campaign"
                className="w-full bg-transparent border border-foreground/20 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-muted-foreground">Expires At (Optional)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-transparent border border-foreground/20 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
              />
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-foreground text-background py-2 text-xs font-mono uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isCreating ? "Deploying..." : "Generate Shortlink"}
            </button>
          </form>
        </motion.div>

        {/* Recent Links */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 border border-foreground/20 bg-background/80 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono font-bold uppercase tracking-widest">Recent Routes</h2>
            <Link href="/dashboard/links" className="text-xs font-mono text-muted-foreground hover:text-foreground hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentLinks.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-muted-foreground uppercase border border-dashed border-foreground/20">
                No routes deployed yet
              </div>
            ) : (
              recentLinks.map((link) => {
                const isExpired = link.expiresAt && new Date(link.expiresAt) < now;
                const isInactive = !link.isActive || isExpired;
                
                return (
                  <div key={link.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border transition-colors gap-4 ${isInactive ? 'opacity-50 border-foreground/5 bg-foreground/5' : 'border-foreground/10 hover:border-foreground/30'}`}>
                    <div className="overflow-hidden">
                      <div className="font-mono text-sm font-bold truncate flex items-center gap-2">
                        {process.env.NEXT_PUBLIC_REDIRECT_BASE_URL || "http://localhost:8080"}/{link.shortCode}
                        {isExpired && <span className="bg-red-500/10 text-red-500 px-1.5 py-0.5 text-[10px] uppercase rounded">Expired</span>}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground truncate mt-1">
                        {link.originalUrl}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-xs font-mono bg-foreground/5 px-2 py-1 rounded">
                        {link.totalClicks} clicks
                      </div>
                      <Link href={`/dashboard/links/${link.id}/stats`}>
                        <button className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground">
                          Stats →
                        </button>
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
