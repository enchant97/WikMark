import { createAuthClient } from "better-auth/react"
import { nextCookies } from "better-auth/next-js"

export const authClient = createAuthClient({
  plugins: [nextCookies()], // `nextCookies()` must always be at end
})
