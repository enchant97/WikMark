import { renderMarkdown } from "@/lib/helpers"
import { Suspense } from "react"
import RenderedPageLoading from "./RenderedPageLoading"

async function Inner(props: { content: string }) {
  const rendered = await renderMarkdown(props.content)
  return <div className="wikiProse" dangerouslySetInnerHTML={{ __html: rendered }}></div>

}

export default async function RenderedPageServer(props: { content: string, title: string }) {
  return (
    <Suspense fallback={<RenderedPageLoading />}>
      {/* hiding the header until content load is a stylistic choice */}
      <h1>{props.title}</h1>
      <Inner content={props.content} />
    </Suspense>
  )
}
