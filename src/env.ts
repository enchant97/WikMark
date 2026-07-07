import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

const SKIP_VALIDATION = process.env.ENABLE_SKIP_VALIDATION === "UNSAFE_ENABLE"

const isAbsolute = (s: string) => s.startsWith("/")
const isValidSQLitePath = (s: string) => {
  return s === ":memory:"
    ? SKIP_VALIDATION
    : isAbsolute(s)
}

const authSecretSchema = SKIP_VALIDATION
  ? z.base64().min(32).optional()
  : z.base64().min(32)

const env = createEnv({
  server: {
    WIKI_PATH: z.coerce.string().refine(isAbsolute, { error: "Expected an absolute path" }),
    DB_PATH: z.coerce.string().refine(isValidSQLitePath, { error: "Expected an absolute path" }),
    SEARCH_DB_PATH: z.coerce.string().refine(isValidSQLitePath, { error: "Expected an absolute path" }),
    AUTH_SECRET: authSecretSchema,
    META_TITLE: z.string().default("WikMark"),
    META_DESCRIPTION: z.string().default("A WikMark Wiki"),
    ENABLE_SIGNUP: z.stringbool().default(true),
    ENABLE_CLIENT_RENDERING: z.stringbool().default(false),
    PUBLIC_URL: z.string().refine(
      (val) => {
        try {
          const url = new URL(val);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: 'Must be a valid http or https URL' }
    ),
  },
  experimental__runtimeEnv: {},
  emptyStringAsUndefined: true,
  skipValidation: SKIP_VALIDATION,
})

export default env
