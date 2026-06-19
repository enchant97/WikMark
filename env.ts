import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

const isAbsolute = (s: string) => s.startsWith("/")

const env = createEnv({
  server: {
    WIKI_PATH: z.coerce.string().refine(isAbsolute, { error: "Expected an absolute path" }),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  },
  emptyStringAsUndefined: true,
})

export default env
