import { getReaderSettings } from "@/lib/actions";
import { joinSlugParts } from "@/lib/helpers";
import Link from "next/link";

export default async function WikiNav({ slugParts, slug, parentSlug, relPageSlugs }: {
  slugParts: string[],
  slug: string,
  parentSlug: string,
  relPageSlugs: string[],
}) {
  const settings = await getReaderSettings()
  return (
    <nav aria-label="Pages" className={`fontScale-${settings.fontScale}`}>
      <ul className="navLink">
        {slug !== "" && <li className="link"><Link href={`/reader/-/${parentSlug}`}>Back</Link></li>}
        {relPageSlugs.map(slugPart => (
          <li className="link" key={slugPart}><Link
            href={`/reader/-/${joinSlugParts([...slugParts, slugPart])}`}
          >{slugPart}</Link></li>
        ))}
      </ul>
    </nav>
  )
}
