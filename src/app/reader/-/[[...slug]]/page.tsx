import { joinSlugParts, makePageTitle, renderMarkdown } from "@/lib/helpers";
import WikiNav from "./_ui/WikiNav";
import env from "@/env";
import { getPageContentParts } from "@/lib/data/page";
import { getReaderSettings, getRelPageSlugs } from "@/lib/actions";

export default async function WikiPage(props: PageProps<"/reader/-/[[...slug]]">) {
  const { slug: slugParts } = await props.params
  const slug = joinSlugParts(slugParts)
  const parentSlug = joinSlugParts((slugParts ?? []).slice(0, -1))
  const baseUrl = `${env.PUBLIC_URL}`
  const basePageUrl = `${env.PUBLIC_URL}/reader/${slug}`
  const { content, metadata } = await getPageContentParts(slug)
  const enablePageTitle = env.ENABLE_PAGE_TITLE
  const pageTitle = makePageTitle(slugParts, metadata)
  const renderedContent = await renderMarkdown(content, { pageSlug: slug, baseUrl, basePageUrl })
  const relPageSlugs = await getRelPageSlugs(slug)
  const settings = await getReaderSettings()
  return (
    <>
      <WikiNav slugParts={slugParts ?? []} slug={slug} parentSlug={parentSlug} relPageSlugs={relPageSlugs} />
      <article
        className={`prose fontScale-${settings.fontScale} textAlign-${settings.textAlign} maxWidth-${settings.maxWidth}`}
        id="mainContent"
        itemScope={true}
        itemType={"https://schema.org/TextDigitalDocument"}
      >
        {enablePageTitle && <header>
          <h1 itemProp={"name headline"}>{pageTitle}</h1>
        </header>}
        <div className="wikiProse" dangerouslySetInnerHTML={{ __html: renderedContent }}></div>
      </article>
    </>
  )
}
