"use client";
import dynamic from "next/dynamic";
import { startTransition, useActionState, useState } from "react";
import NextLink from "@/components/NextLink"
import { HeaderMenu } from "@/components/WikiHeader";
import Cancel from "@mui/icons-material/Cancel";
import Save from "@mui/icons-material/Save";
import { InlineAppErrorAlert } from "@/components/InlineAlert";
import ResponsiveButton from "@/components/ResponsiveButton";
import { PageMetadata } from "@/lib/types";
import ButtonGroup from '@mui/material/ButtonGroup';
import { ErrorDTO } from "@/lib/errors";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false })

async function uploadPageContentAction(_prevState, payload: { fullSlug: string, content: string, metadata: PageMetadata }) {
  const formData = new FormData()
  formData.set("fullSlug", payload.fullSlug)
  formData.set("content", payload.content)
  formData.set("metadata", JSON.stringify(payload.metadata))
  const resp = await fetch("/api/upload/pages", {
    method: "POST",
    body: formData,
  })
  if (resp.ok) { return (await resp.json()) as { success: boolean } }
  if (resp.headers.get("Content-Type") === "application/x.wikmark.error+json") {
    return (await resp.json()) as { error: ErrorDTO }
  }
  throw new Error("action failed")
}

export default function WikiEditor(props: {
  fullSlug: string,
  initialContent: string,
  metadata: PageMetadata,
  baseUrl: string,
}) {
  const [draftContent, setDraftContent] = useState(props.initialContent)
  const [savedContent, setSavedContent] = useState(props.initialContent)
  const [contentState, dispatchUpdateContent, updateContentPending] = useActionState(uploadPageContentAction, null)
  const isSaved = draftContent === savedContent && !updateContentPending
  return (
    <>
      <HeaderMenu>
        <ButtonGroup>
          <ResponsiveButton startIcon={<Cancel />} LinkComponent={NextLink} href={`/-/${props.fullSlug}`}>Cancel</ResponsiveButton>
          <ResponsiveButton
            color={isSaved ? "primary" : "warning"}
            startIcon={<Save />}
            loading={updateContentPending}
            disabled={updateContentPending}
            onClick={() => {
              setSavedContent(draftContent)
              startTransition(() => dispatchUpdateContent({
                fullSlug: props.fullSlug,
                content: draftContent,
                metadata: props.metadata,
              }))
            }}>
            Save
          </ResponsiveButton>
        </ButtonGroup>
      </HeaderMenu>
      {(contentState?.error && !updateContentPending) && <InlineAppErrorAlert err={contentState.error} />}
      <Editor
        pageSlug={props.fullSlug}
        initialContent={props.initialContent}
        isReadOnly={false}
        onChange={(v) => {
          setDraftContent(v)
        }}
        baseUrl={props.baseUrl}
      />
    </>
  )
}
