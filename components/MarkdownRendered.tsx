import { renderMarkdown } from "@/lib/helpers"

export default async function MarkdownRendered(props: { md: string }) {
  const rendered = await renderMarkdown(props.md)
  return <div dangerouslySetInnerHTML={{ __html: rendered }}></div>
}
