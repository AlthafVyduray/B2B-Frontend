"use client"

import React, { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import useAuthStore from "@/stores/useAuthStore"

export default function AuthGuard({ children }) {
  const { user, checkAuth } = useAuthStore()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()
  const pathname = usePathname() || "/"

  const PUBLIC_ALLOW = ["/", "/signup", "/login", "/forgot-password", "/reset-password"]
  const ADMIN_ALLOW = ["/", "/dashboard", "/bookings", "/vehicles", "/agents", "/users", "/notifications", "/packages", "/hotels", "/pricing", "/settings"]
  const AGENT_ALLOW = ["/", "/notification", "/edit-profile", "/booking"]

  const normalize = (p) => {
    if (!p) return "/"
    if (p === "/") return "/"
    return p.startsWith("/") ? p.replace(/\/+$/, "") : `/${p.replace(/\/+$/, "")}`
  }

  const isPathAllowed = (allowList) => {
    return allowList.some((p) => {
      const prefix = normalize(p)
      if (prefix === "/") return pathname === "/"
      return pathname === prefix || pathname.startsWith(prefix + "/")
    })
  }

  // 1) Always set checking true and clear allowed before verifying.
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setChecking(true)
        setAllowed(false)         // important: clear previous allowed value
        setRedirecting(false)
        await checkAuth()
      } catch (e) {
        // store handles errors
      } finally {
        if (mounted) setChecking(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [checkAuth, pathname]) // re-check when pathname changes if you want

  // 2) Decide permission & redirect — never set allowed=true unless explicitly permitted.
  useEffect(() => {
    if (checking) return

    // default deny until proven allowed
    let shouldAllow = false

    if (!user) {
      // public paths allowed even without login
      shouldAllow = isPathAllowed(PUBLIC_ALLOW)
      if (!shouldAllow) {
        setAllowed(false)
        setRedirecting(true)
        router.replace(`/login?next=${encodeURIComponent(pathname)}`)
        return
      }
      setAllowed(true)
      return
    }

    // logged in: role-based checks
    if (user.role === "Admin") {
      shouldAllow = isPathAllowed(ADMIN_ALLOW)
      if (!shouldAllow) {
        setAllowed(false)
        setRedirecting(true)
        router.replace("/dashboard")
        return
      }
      setAllowed(true)
      return
    }

    if (user.role === "Agent") {
      shouldAllow = isPathAllowed(AGENT_ALLOW)
      if (!shouldAllow) {
        setAllowed(false)
        setRedirecting(true)
        router.replace("/")
        return
      }
      setAllowed(true)
      return
    }

    // fallback: allow only home
    if (pathname === "/") {
      setAllowed(true)
    } else {
      setAllowed(false)
      setRedirecting(true)
      router.replace("/")
    }
  }, [user, checking, pathname, router])

  // Render logic:
  // - While checking: show loader
  // - While redirecting OR not allowed: render nothing (children must not mount)
  // - Only when allowed: render children
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full border-4 border-t-blue-600 border-b-blue-600 w-12 h-12"></div>
      </div>

    )
  }

  if (redirecting || !allowed) {
    // return null to ensure children never mount (no network calls / effects)
    return null
  }

  return <>{children}</>
}
