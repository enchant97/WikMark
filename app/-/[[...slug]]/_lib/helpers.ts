export function joinSlugParts(parts?: string[]): string {
  return (parts ?? []).join("/")
}
