import env from "@/env";
import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

export const auth = betterAuth({
  database: new Database(env.DB_PATH),
  secret: env.AUTH_SECRET,
  baseURL: env.NEXT_PUBLIC_PUBLIC_URL,
  appName: "WikMark",
  advanced: {
    cookiePrefix: "WikMark",
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: !env.NEXT_PUBLIC_ENABLE_SIGNUP,
  },
})
