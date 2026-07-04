import * as z from "zod";

const PageMetadataSchema = z.looseObject({
  title: z.string().optional(),
})

export type PageMetadata = z.infer<typeof PageMetadataSchema>

export function parsePageMetadata(v: object): PageMetadata {
  return PageMetadataSchema.parse(v)
}
