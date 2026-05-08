"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { motion } from "framer-motion"
import { Copy, ExternalLink, Activity, CheckCircle, XCircle, Clock, Infinity as InfinityIcon } from "lucide-react"
import Link from "next/link"

interface ShortLink {
  id: string
  originalUrl: string
  shortCode: string
  title?: string
  totalClicks: number
  createdAt: string
  expiresAt?: string | null
  isActive: boolean
}

export default function LinksPage() {
  const [links, setLinks] = useState<ShortLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const data = await apiClient.get<ShortLink[]>("/links")
      setLinks(data || [])
    } catch (err: any) {
      setError(err.message || "Failed to load routes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (shortCode: string, id: string) => {
    const url = `${process.env.NEXT_PUBLIC_REDIRECT_BASE_URL || "http://localhost:8080"}/${shortCode}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (isLoading) return <div className="font-mono text-sm">RETRIEVING ROUTING TABLE...</div>

  if (error) return <div className="font-mono text-sm text-red-500">ERROR: {error}</div>

  const now = new Date()

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-pixel text-3xl mb-2">ROUTING TABLE</h1>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            All deployed shortlinks
          </p>
        </div>
        <Link href="/dashboard">
          <button className="bg-foreground text-background px-4 py-2 text-xs font-mono uppercase tracking-widest hover:opacity-90 transition-opacity">
            + New Route
          </button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-foreground/20 bg-background/50 backdrop-blur-sm overflow-x-auto"
      >
        <table className="w-full text-left text-sm font-mono">
          <thead className="bg-foreground/5 border-b border-foreground/20 uppercase text-xs tracking-widest text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-normal">Alias / Target</th>
              <th className="px-6 py-4 font-normal">Shortlink</th>
              <th className="px-6 py-4 font-normal">Stats</th>
              <th className="px-6 py-4 font-normal">Status</th>
              <th className="px-6 py-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/10">
            {links.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground border-dashed">
                  No routes deployed
                </td>
              </tr>
            ) : (
              links.map((link) => {
                const shortUrl = `${process.env.NEXT_PUBLIC_REDIRECT_BASE_URL || "http://localhost:8080"}/${link.shortCode}`
                const isExpired = link.expiresAt && new Date(link.expiresAt) < now;
                const isInactive = !link.isActive;
                const isDead = isExpired || isInactive;
                
                return (
                  <tr key={link.id} className={`transition-colors ${isDead ? 'opacity-50 bg-foreground/5' : 'hover:bg-foreground/5'}`}>
                    <td className="px-6 py-4 max-w-[200px] truncate">
                      <div className="font-bold">{link.title || link.shortCode}</div>
                      <div className="text-xs text-muted-foreground truncate" title={link.originalUrl}>
                        {link.originalUrl}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[150px]">{shortUrl}</span>
                        {!isDead && (
                          <>
                            <button
                              onClick={() => handleCopy(link.shortCode, link.id)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy to clipboard"
                            >
                              {copiedId === link.id ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                            <a
                              href={shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Open link"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </>
                        )}
                        {isDead && (
                           <span className="text-xs text-red-500 flex items-center gap-1"><XCircle size={12}/> This link has expired</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-foreground/10 px-2 py-1 rounded text-xs">
                        {link.totalClicks} clicks
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {!link.isActive ? (
                          <span className="text-red-500 flex items-center gap-1 text-xs">
                            <XCircle size={12} /> Inactive
                          </span>
                        ) : isExpired ? (
                          <span className="text-red-500 flex items-center gap-1 text-xs">
                            <XCircle size={12} /> Expired
                          </span>
                        ) : (
                          <span className="text-green-500 flex items-center gap-1 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                            Active
                          </span>
                        )}
                        
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          {!link.expiresAt ? (
                            <><InfinityIcon size={10} /> Never expires</>
                          ) : isExpired ? (
                             <><Clock size={10} /> Expired at {new Date(link.expiresAt).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</>
                          ) : (
                             <><Clock size={10} /> Expires at {new Date(link.expiresAt).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/links/${link.id}/stats`}>
                        <button className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground border border-foreground/20 px-3 py-1.5 hover:bg-foreground/5 transition-colors flex items-center gap-2 inline-flex">
                          <Activity size={14} /> Metrics
                        </button>
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
