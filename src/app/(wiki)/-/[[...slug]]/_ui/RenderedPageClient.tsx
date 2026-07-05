"use client";
import { renderMarkdown } from "@/lib/helpers"
import { useEffect, useState } from "react"
import RenderedPageLoading from "./RenderedPageLoading"
import { PageMetadata } from "@/lib/types";
import PageFooter from "./PageFooter";

export default function RenderedPageClient(props: { content: string, title: string, metadata: PageMetadata }) {
  const [rendered, setRendered] = useState<string | null>(null)
  useEffect(() => {
    const startTime = performance.now()
    renderMarkdown(props.content).then(setRendered).then(() => {
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
        <h1>{props.title}</h1>
        <div className="wikiProse" dangerouslySetInnerHTML={{ __html: rendered }}></div>
        <PageFooter metadata={props.metadata} />
      </>
    }
    </>
  )
}
