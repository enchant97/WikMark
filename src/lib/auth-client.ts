import { createAuthClient } from "better-auth/react"
import env from "@/env"
import { nextCookies } from "better-auth/next-js"

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_PUBLIC_URL,
  plugins: [nextCookies()], // `nextCookies()` must always be at end
})
