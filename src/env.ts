import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

const isAbsolute = (s: string) => s.startsWith("/")

const env = createEnv({
  server: {
    WIKI_PATH: z.coerce.string().refine(isAbsolute, { error: "Expected an absolute path" }),
    DB_PATH: z.coerce.string().refine(isAbsolute, { error: "Expected an absolute path" }),
    SEARCH_DB_PATH: z.coerce.string().refine(isAbsolute, { error: "Expected an absolute path" }),
    AUTH_SECRET: z.base64().min(32),
  },
  client: {
    NEXT_PUBLIC_ENABLE_SIGNUP: z.stringbool().default(true),
    NEXT_PUBLIC_ENABLE_CLIENT_RENDERING: z.stringbool().default(false),
    NEXT_PUBLIC_PUBLIC_URL: z.string().refine(
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
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ENABLE_SIGNUP: process.env.NEXT_PUBLIC_ENABLE_SIGNUP,
    NEXT_PUBLIC_PUBLIC_URL: process.env.NEXT_PUBLIC_PUBLIC_URL,
    NEXT_PUBLIC_ENABLE_CLIENT_RENDERING: process.env.NEXT_PUBLIC_ENABLE_CLIENT_RENDERING,
  },
  emptyStringAsUndefined: true,
})

export default env
