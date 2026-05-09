"use client"

import { useEffect, useState, use } from "react"
import { apiClient } from "@/lib/api-client"
import { motion } from "framer-motion"
import { ArrowLeft, Monitor, Globe, Clock, Hash, Calendar, AlertCircle } from "lucide-react"
import Link from "next/link"
import { ShortLinkDisplay } from "@/components/ShortLinkDisplay"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

interface ShortLink {
  id: string
  originalUrl: string
  shortCode: string
  totalClicks: number
  createdAt: string
  expiresAt?: string | null
  isActive: boolean
}

interface ClickEvent {
  id: string
  shortLinkId: string
  ipAddress?: string
  userAgent?: string
  referrer?: string
  clickedAt: string
}

interface StatsResponse {
  link: ShortLink
  totalClicks: number
  clicks: ClickEvent[]
}

export default function StatsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    setOrigin(typeof window !== 'undefined' ? window.location.origin : '')
    fetchStats()
  }, [resolvedParams.id])

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<StatsResponse>(`/links/${resolvedParams.id}/stats`)
      setStats(data)
    } catch (err: any) {
      setError(err.message || "Failed to load telemetry data")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div className="font-mono text-sm">ANALYZING TELEMETRY...</div>
  if (error) return <div className="font-mono text-sm text-red-500">ERROR: {error}</div>
  if (!stats) return <div className="font-mono text-sm">NO DATA FOUND</div>

  // Process data for chart (clicks per day)
  const chartDataMap = new Map<string, number>()
  stats.clicks.forEach(click => {
    const date = new Date(click.clickedAt).toLocaleDateString()
    chartDataMap.set(date, (chartDataMap.get(date) || 0) + 1)
  })

  const chartData = Array.from(chartDataMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7) // Last 7 days with data

  const now = new Date()
  const isExpired = stats.link?.expiresAt && new Date(stats.link.expiresAt) < now
  const isInactive = !stats.link?.isActive
  
  let statusText = "Active"
  let statusColor = "text-green-500"
  
  if (isInactive) {
    statusText = "Inactive"
    statusColor = "text-red-500"
  } else if (isExpired) {
    statusText = "Expired"
    statusColor = "text-red-500"
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/links">
          <button className="p-2 border border-foreground/20 hover:bg-foreground/5 transition-colors">
            <ArrowLeft size={16} />
          </button>
        </Link>
        <div>
          <h1 className="font-pixel text-3xl mb-1">ROUTE TELEMETRY</h1>
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              ID: {resolvedParams.id}
            </p>
            {stats && origin && (
              <div className="bg-background/50 border border-foreground/10 p-2 max-w-lg">
                <ShortLinkDisplay shortUrl={`${origin}/${stats.link.shortCode}`} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-foreground/20 bg-background/50 p-6"
        >
          <div className="text-xs font-mono uppercase text-muted-foreground mb-4 flex items-center justify-between">
            <span>Status</span>
            <AlertCircle size={14} />
          </div>
          <div className={`text-2xl font-pixel ${statusColor}`}>{statusText}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-foreground/20 bg-background/50 p-6"
        >
          <div className="text-xs font-mono uppercase text-muted-foreground mb-4 flex items-center justify-between">
            <span>Created At</span>
            <Calendar size={14} />
          </div>
          <div className="text-lg font-mono truncate">
            {stats.link ? new Date(stats.link.createdAt).toLocaleDateString() : 'N/A'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-foreground/20 bg-background/50 p-6"
        >
          <div className="text-xs font-mono uppercase text-muted-foreground mb-4 flex items-center justify-between">
            <span>Expires At</span>
            <Clock size={14} />
          </div>
          <div className="text-lg font-mono truncate">
            {!stats.link?.expiresAt 
              ? 'Never' 
              : new Date(stats.link.expiresAt).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
            }
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-foreground/20 bg-background/50 p-6"
        >
          <div className="text-xs font-mono uppercase text-muted-foreground mb-4 flex items-center justify-between">
            <span>Total Events</span>
            <Hash size={14} />
          </div>
          <div className="text-4xl font-pixel">{stats.totalClicks}</div>
        </motion.div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border border-foreground/20 bg-background/50 p-6 h-[300px]"
        >
          <div className="text-xs font-mono uppercase text-muted-foreground mb-6">Event Frequency (Last 7 Active Days)</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '0' }}
                itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                labelStyle={{ color: '#888', fontFamily: 'monospace', marginBottom: '8px' }}
                cursor={{ fill: '#333', opacity: 0.4 }}
              />
              <Bar dataKey="count" fill="#fff" radius={[2, 2, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Events Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border border-foreground/20 bg-background/50 overflow-x-auto"
      >
        <div className="p-4 border-b border-foreground/20">
          <h2 className="font-mono font-bold uppercase tracking-widest text-sm">Raw Event Log</h2>
        </div>
        <table className="w-full text-left text-sm font-mono">
          <thead className="bg-foreground/5 border-b border-foreground/20 uppercase text-xs tracking-widest text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-normal"><div className="flex items-center gap-2"><Clock size={14} /> Timestamp</div></th>
              <th className="px-6 py-4 font-normal"><div className="flex items-center gap-2"><Globe size={14} /> Source IP</div></th>
              <th className="px-6 py-4 font-normal"><div className="flex items-center gap-2"><Globe size={14} /> Referrer</div></th>
              <th className="px-6 py-4 font-normal"><div className="flex items-center gap-2"><Monitor size={14} /> User Agent</div></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/10">
            {stats.clicks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground border-dashed">
                  No events recorded
                </td>
              </tr>
            ) : (
              stats.clicks.map((click) => (
                <tr key={click.id} className="hover:bg-foreground/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(click.clickedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {click.ipAddress || "Unknown"}
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate" title={click.referrer}>
                    {click.referrer || "Direct"}
                  </td>
                  <td className="px-6 py-4 max-w-[300px] truncate text-xs text-muted-foreground" title={click.userAgent}>
                    {click.userAgent || "Unknown"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
