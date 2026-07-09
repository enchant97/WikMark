import { joinSlugParts, makePageTitle, renderMarkdown } from "@/lib/helpers"
import { Suspense } from "react"
import RenderedPageLoading from "./RenderedPageLoading"
import PageFooter from "./PageFooter"
import { PageMetadata } from "@/lib/types"

async function Inner(props: { content: string, pageSlug: string, baseUrl: string }) {
  const rendered = await renderMarkdown(props.content, { pageSlug: props.pageSlug, baseUrl: props.baseUrl })
  return <div className="wikiProse" dangerouslySetInnerHTML={{ __html: rendered }}></div>

}

export default async function RenderedPageServer(props: {
  slugParts?: string[],
  content: string,
  metadata: PageMetadata,
  baseUrl: string,
}) {
  const pageTitle = makePageTitle(props.slugParts, props.metadata)
  return (
    <Suspense fallback={<RenderedPageLoading />}>
      {/* hiding the header until content load is a stylistic choice */}
      <h1>{pageTitle}</h1>
      <Inner content={props.content} pageSlug={joinSlugParts(props.slugParts)} baseUrl={props.baseUrl} />
      <PageFooter metadata={props.metadata} />
    </Suspense>
  )
}
