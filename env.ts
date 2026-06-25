import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

const isAbsolute = (s: string) => s.startsWith("/")

const env = createEnv({
  server: {
    WIKI_PATH: z.coerce.string().refine(isAbsolute, { error: "Expected an absolute path" }),
  },
  client: {
    NEXT_PUBLIC_ENABLE_LANDING: z.coerce.boolean().default(true),
    NEXT_PUBLIC_ENABLE_CLIENT_RENDERING: z.coerce.boolean().default(false),
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
    NEXT_PUBLIC_PUBLIC_URL: process.env.NEXT_PUBLIC_PUBLIC_URL,
    NEXT_PUBLIC_ENABLE_CLIENT_RENDERING: process.env.NEXT_PUBLIC_ENABLE_CLIENT_RENDERING,
  },
  emptyStringAsUndefined: true,
})

export default env
