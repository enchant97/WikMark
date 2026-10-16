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

const ReaderScaleEnum = z.enum(["sm", "md", "lg", "xl"])
export type ReaderScale = z.infer<typeof ReaderScaleEnum>
const ReaderAlignEnum = z.enum(["normal", "justify", "center"])
export type ReaderAlign = z.infer<typeof ReaderAlignEnum>
const ReaderWidthEnum = z.enum(["sm", "md", "lg", "full"])
export type ReaderWidth = z.infer<typeof ReaderWidthEnum>
const ReaderSettingsSchema = z.object({
  fontScale: ReaderScaleEnum.default("md"),
  textAlign: ReaderAlignEnum.default("normal"),
  maxWidth: ReaderWidthEnum.default("md"),
}).default({
  fontScale: "md",
  textAlign: "normal",
  maxWidth: "md",
})
export type ReaderSettings = z.infer<typeof ReaderSettingsSchema>

export function parseReaderSettings(v: unknown): ReaderSettings {
  return ReaderSettingsSchema.parse(v)
}
