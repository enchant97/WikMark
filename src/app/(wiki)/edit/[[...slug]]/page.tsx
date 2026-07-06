import { getPageContentParts } from "@/lib/data/page"
import { joinSlugParts } from "@/lib/helpers"
import WikiEditor from "./_ui/WikiEditor"
import env from "@/env"

export default async function WikiEditPage(props: PageProps<"/edit/[[...slug]]">) {
  const { slug } = await props.params
  const fullSlug = joinSlugParts(slug)
  const initialContentParts = await getPageContentParts(fullSlug)
  return (
    <WikiEditor
      fullSlug={fullSlug}
      initialContent={initialContentParts.content}
      metadata={initialContentParts.metadata}
      baseUrl={env.PUBLIC_URL}
    />
  )
}
