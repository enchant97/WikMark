"use client"
import dynamic from "next/dynamic";
import { use } from "react"

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false })

export default function WikiEditor(props: { fullSlug: string, initialContent: Promise<string> }) {
  const initialContent = use(props.initialContent)
  return (
    <Editor
      pageId={props.fullSlug}
      initialContent={initialContent}
      isReadOnly={false}
    />
  )
}
