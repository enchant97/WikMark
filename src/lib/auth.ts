import env from "@/env";
import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { AppError, AppErrorCode } from "./errors";
import { headers } from "next/headers";

export const auth = betterAuth({
  database: new Database(env.DB_PATH),
  secret: env.AUTH_SECRET,
  baseURL: env.PUBLIC_URL,
  appName: "WikMark",
  advanced: {
    cookiePrefix: "WikMark",
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: !env.ENABLE_SIGNUP,
  },
})

/**
 * @throws {AppError} - User was not authenticated.
 */
export async function throwIfUnauthorized() {
  if ((await auth.api.getSession({ headers: await headers() })) === null) {
    throw new AppError("this action requires authentication", AppErrorCode.Unauthorized)
  }
}
