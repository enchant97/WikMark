"use client"
import { InlineAppErrorAlert } from "@/components/InlineAlert";
import { createPageAction } from "@/lib/actions";
import { useModalNavigation } from "@/lib/ModalNavigationContext";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import Form from 'next/form'
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

export default function NewPageModal(props: { parentSlug: string }) {
  const { closeAndNavigate } = useModalNavigation()
  const router = useRouter()
  const [createState, dispatchCreate, createPending] = useActionState(createPageAction, null)
  const [open, setOpen] = useState(true)
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
              required
              fullWidth
            />
            <TextField
              name="slug"
              label="Slug"
              helperText="URL-friendly name of page"
              required
              fullWidth
            />
            <TextField
              name="parentSlug"
              label="Parent Slug"
              helperText="where the page will be created under (leave blank for root)"
              defaultValue={props.parentSlug}
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
