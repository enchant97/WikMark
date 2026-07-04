'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

let pendingPath: string | null = null
let prevPath: string | null = null

export function ModalNavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  useEffect(() => {
    if (pendingPath && pathname !== prevPath) {
      const to = pendingPath
      pendingPath = null
      prevPath = null
      router.push(to)
    }
  }, [router, pathname])
  return <>{children}</>
}

/**
 * Use to properly close a @slot modal when a router.push() is required.
 *
 * Seems like when next.js caches state but does not clear when pushing,
 * only when router.back() (pop) is run.
 */
export function useModalNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const closeAndNavigate = (path: string) => {
    prevPath = pathname
    pendingPath = path
    router.back()
  }
  return { closeAndNavigate }
}
