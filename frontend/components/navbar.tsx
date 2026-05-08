"use client"

import { Link as LinkIcon, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('accessToken'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full px-4 pt-4 lg:px-6 lg:pt-6"
    >
      <nav className="w-full border border-foreground/20 bg-background/80 backdrop-blur-sm px-6 py-3 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <LinkIcon size={16} strokeWidth={1.5} />
              <span className="text-xs font-mono tracking-[0.15em] uppercase font-bold">
                SHORT.LY
              </span>
            </motion.div>
          </Link>

          {/* Right side: Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex items-center gap-4"
          >
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden sm:block text-xs font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs font-mono tracking-widest uppercase"
                >
                  <LogOut size={14} />
                  Log Out
                </motion.button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block text-xs font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-foreground text-background px-4 py-2 text-xs font-mono tracking-widest uppercase"
                  >
                    Register
                  </motion.button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </nav>
    </motion.div>
  )
}
