"use client"

import { useState } from "react"
import { Copy, ExternalLink, CheckCircle } from "lucide-react"

interface ShortLinkDisplayProps {
  shortUrl: string
}

export function ShortLinkDisplay({ shortUrl }: ShortLinkDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 max-w-full">
      <div className="font-mono text-sm font-bold break-all">
        {shortUrl}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleCopy}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded transition-colors flex items-center justify-center"
          title="Copy to clipboard"
          type="button"
        >
          {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded transition-colors flex items-center justify-center"
          title="Open link in new tab"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  )
}
