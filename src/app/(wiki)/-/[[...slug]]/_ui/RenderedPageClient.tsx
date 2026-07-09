"use client";
import { joinSlugParts, makePageTitle, renderMarkdown } from "@/lib/helpers"
import { useEffect, useState } from "react"
import RenderedPageLoading from "./RenderedPageLoading"
import { PageMetadata } from "@/lib/types";
import PageFooter from "./PageFooter";

export default function RenderedPageClient(props: {
  slugParts?: string[],
  content: string,
  metadata: PageMetadata,
  baseUrl: string,
}) {
  const pageTitle = makePageTitle(props.slugParts, props.metadata)
  const pageSlug = joinSlugParts(props.slugParts)
  const [rendered, setRendered] = useState<string | null>(null)
  useEffect(() => {
    const startTime = performance.now()
    renderMarkdown(props.content, { baseUrl: props.baseUrl, pageSlug }).then(setRendered).then(() => {
      const endTime = performance.now()
      const durationMs = Math.round(endTime - startTime)
      console.debug(`client-side markdown rendering took: ${durationMs}ms`)
    })
  }, [])
  return (
    <>{rendered === null
      ? <RenderedPageLoading />
      : <>
        {/* hiding the header until content load is a stylistic choice */}
        <h1>{pageTitle}</h1>
        <div className="wikiProse" dangerouslySetInnerHTML={{ __html: rendered }}></div>
        <PageFooter metadata={props.metadata} />
      </>
    }
    </>
  )
}
