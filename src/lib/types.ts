import * as z from "zod";

const PageMetadataSchema = z.looseObject({
  title: z.string().optional(),
  createdAt: z.iso.datetime().catch(() => (new Date()).toISOString()).readonly(),
  updatedAt: z.iso.datetime().catch(() => (new Date()).toISOString()),
})

export type PageMetadata = z.infer<typeof PageMetadataSchema>

/**
 * Unvalidated/Unparsed `PageMetadata`.
 */
export type MaybePageMetadata = object

export function parsePageMetadata(v: MaybePageMetadata): PageMetadata {
  return PageMetadataSchema.parse(v)
}
