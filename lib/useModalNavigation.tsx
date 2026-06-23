"use client"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

/**
 * Use to properly close a @slot modal when a router.push() is required.
 *
 * Seems like when next.js caches state but does not clear when pushing,
 * only when router.back() (pop) is run.
 */
export default function useModalNavigation() {
  const router = useRouter()
  const pendingNav = useRef<string | null>(null)

  useEffect(() => {
    const handlePopState = () => {
      if (pendingNav.current) {
        const path = pendingNav.current
        pendingNav.current = null
        router.push(path)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [router])

  const closeAndNavigate = (path: string) => {
    pendingNav.current = path
    router.back()
  }

  return { closeAndNavigate }
}
