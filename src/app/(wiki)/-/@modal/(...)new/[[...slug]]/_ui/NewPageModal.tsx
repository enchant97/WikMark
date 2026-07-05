"use client";
import { InlineAppErrorAlert } from "@/components/InlineAlert";
import { createPageAction } from "@/lib/actions";
import { intoPageSlug, intoPageSlugPart } from "@/lib/helpers";
import { useModalNavigation } from "@/lib/ModalNavigationContext";
import Form from 'next/form'
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export default function NewPageModal(props: { parentSlug: string }) {
  const { closeAndNavigate } = useModalNavigation()
  const router = useRouter()
  const [createState, dispatchCreate, createPending] = useActionState(createPageAction, null)
  const [open, setOpen] = useState(true)
  const [pageSlug, setPageSlug] = useState("")
  const [parentSlug, setParentSlug] = useState(props.parentSlug)

  useEffect(() => {
    if (createState?.success) {
      setOpen(false)
      closeAndNavigate(`/-/${createState.fullSlug}`)
    }
  }, [createState])

  const onClose = () => {
    setOpen(false)
    router.back()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create Page</DialogTitle>
      <DialogContent>
        <Form id="createPageForm" action={dispatchCreate}>
          <Stack spacing={1} sx={{ padding: 1 }}>
            <TextField
              name="title"
              label="Title"
              helperText="the title of the page (will display as h1)"
              onChange={(ev) => setPageSlug(intoPageSlugPart(ev.currentTarget.value))}
              required
              fullWidth
            />
            <TextField
              name="slug"
              label="Slug"
              helperText="URL-friendly name of page"
              value={pageSlug}
              onChange={(ev) => setPageSlug(intoPageSlugPart(ev.currentTarget.value))}
              required
              fullWidth
            />
            <TextField
              name="parentSlug"
              label="Parent Slug"
              helperText="where the page will be created under (leave blank for root)"
              value={parentSlug}
              onChange={(ev) => setParentSlug(intoPageSlug(ev.currentTarget.value))}
              fullWidth
            />
          </Stack>
        </Form>
        {(createState?.error && !createPending) && <InlineAppErrorAlert err={createState.error} />}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={createPending}
        >Cancel</Button>
        <Button
          form="createPageForm"
          type="submit"
          loading={createPending}
        >Create</Button>
      </DialogActions>
    </Dialog>
  )
}
