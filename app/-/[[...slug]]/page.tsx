import { getPageContentAsHTML } from "./_lib/data";
import { joinSlugParts } from "./_lib/helpers";

export default async function WikiPage(props: PageProps<'/-/[[...slug]]'>) {
  const { slug } = await props.params
  const pageContent = await getPageContentAsHTML(joinSlugParts(slug))
  return (
    <>
      <h1>Wiki Page</h1>
      <div dangerouslySetInnerHTML={{ __html: pageContent }}></div>
    </>
  )
}
