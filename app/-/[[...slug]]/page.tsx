import WikiEditor from "./_components/WikiEditor";
import { getPageContentAsHTML, getPageContentParts } from "./_lib/data";
import { joinSlugParts } from "./_lib/helpers";

async function WikiPageViewer({ slugParts }: { slugParts: string[] }) {
  const pageContent = await getPageContentAsHTML(joinSlugParts(slugParts))
  return (
    <>
      <h1>Wiki Page</h1>
      <div dangerouslySetInnerHTML={{ __html: pageContent }}></div>
    </>
  )
}

async function WikiPageEditor({ slugParts }: { slugParts: string[] }) {
  const fullSlug = joinSlugParts(slugParts)
  const initialContentParts = await getPageContentParts(fullSlug)
  return (
    <>
      <h1>Wiki Editor</h1>
      <WikiEditor
        fullSlug={fullSlug}
        initialContent={initialContentParts.content}
        metadata={initialContentParts.metadata}
      />
    </>
  )
}

export default async function WikiPage(props: PageProps<'/-/[[...slug]]'>) {
  const { slug } = await props.params
  const { mode } = await props.searchParams
  if (mode === "edit") {
    return <WikiPageEditor slugParts={slug ?? []} />
  }
  return <WikiPageViewer slugParts={slug ?? []} />
}
