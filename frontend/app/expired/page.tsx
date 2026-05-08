"use client"

import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { AlertTriangle, Home } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

function ExpiredContent() {
  const searchParams = useSearchParams()
  const shortCode = searchParams.get("shortCode")
  const expiredAt = searchParams.get("expiredAt")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-foreground/20 bg-background/50 backdrop-blur-sm p-8 max-w-md w-full text-center"
    >
      <div className="flex justify-center mb-6">
        <div className="bg-red-500/10 p-4 rounded-full">
          <AlertTriangle size={48} className="text-red-500" />
        </div>
      </div>
      
      <h1 className="font-pixel text-3xl mb-4">Oh no, this link expired</h1>
      
      <div className="space-y-4 mb-8 font-mono text-sm text-muted-foreground">
        {shortCode && (
          <p>
            The route <span className="text-foreground font-bold">{shortCode}</span> is no longer active.
          </p>
        )}
        
        {expiredAt && (
          <p>
            It expired at: <br/>
            <span className="text-foreground font-bold block mt-1">
              {new Date(expiredAt).toLocaleString(undefined, { 
                day: 'numeric', month: 'short', year: 'numeric', 
                hour: 'numeric', minute: '2-digit' 
              })}
            </span>
          </p>
        )}
      </div>

      <Link href="/">
        <button className="w-full bg-foreground text-background py-3 font-mono uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          <Home size={16} /> Go back home
        </button>
      </Link>
    </motion.div>
  )
}

export default function ExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background terminal decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 font-mono text-xs">
          ERR_ROUTE_EXPIRED<br/>
          CONNECTION_TERMINATED<br/>
          STATUS_CODE: 410_GONE
        </div>
        <div className="absolute bottom-10 right-10 font-mono text-xs text-right">
          SYS.INT.URL.ROUTING_SERVICE<br/>
          FAIL_SAFE_TRIGGERED
        </div>
      </div>

      <Suspense fallback={<div className="font-mono text-sm">LOADING STATUS...</div>}>
        <ExpiredContent />
      </Suspense>
    </div>
  )
}
