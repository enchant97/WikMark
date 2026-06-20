import { getPageContentAsHTML, getPageContentRaw } from "./_lib/data";
import { joinSlugParts } from "./_lib/helpers";

async function WikiPageEditor({ slugParts }: { slugParts: string[] }) {
  const pageContent = await getPageContentRaw(joinSlugParts(slugParts))
  return (
    <>
      <h1>Editor</h1>
    </>
  )
}

async function WikiPageViewer({ slugParts }: { slugParts: string[] }) {
  const pageContent = await getPageContentAsHTML(joinSlugParts(slugParts))
  return (
    <>
      <h1>Wiki Page</h1>
      <div dangerouslySetInnerHTML={{ __html: pageContent }}></div>
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
