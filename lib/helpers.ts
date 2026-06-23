export function joinSlugParts(parts?: string[]): string {
  return (parts ?? []).join("/")
}

/**
 * Return last element of given slug parts
 */
export function slugPartsBase(parts?: string[]): string {
  return ((parts ?? []).at(-1) ?? "")
}
