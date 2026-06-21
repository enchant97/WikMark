"use client"
import dynamic from "next/dynamic";
import { startTransition, useActionState, useState } from "react";
import { updatePageContentsAction } from "../_lib/actions";
import { IconButton } from "@mui/material";
import SaveIcon from "@/components/SaveIcon";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false })

export default function WikiEditor(props: {
  fullSlug: string,
  initialContent: string,
  metadata: Object,
}) {
  const [draftContent, setDraftContent] = useState(props.initialContent)
  const [contentState, dispatchUpdateContent, updateContentPending] = useActionState(updatePageContentsAction, draftContent)
  const isSaved = draftContent === contentState
  return (
    <>
      <IconButton
        aria-label="save"
        loading={updateContentPending}
        disabled={updateContentPending}
        onClick={() => startTransition(() => dispatchUpdateContent({
          fullSlug: props.fullSlug,
          content: draftContent,
          metadata: props.metadata,
        }))}>
        <SaveIcon isSaved={isSaved} />
      </IconButton>
      <Editor
        pageId={props.fullSlug}
        initialContent={props.initialContent}
        isReadOnly={false}
        onChange={(v) => {
          setDraftContent(v)
        }}
      />
    </>
  )
}
