"use client"
import { createPageAction } from "@/lib/actions";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import Form from 'next/form'
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

export default function NewPageModal(props: { parentSlug: string }) {
  const router = useRouter()
  const [state, action] = useActionState(createPageAction, null)
  const [open, setOpen] = useState(true)
  useEffect(() => {
    if (state?.success) {
      setOpen(false)
      router.push(`/-/${state.fullSlug}`)
    }
  }, [state])
  return (
    <Dialog open={open} onClose={() => router.back()}>
      <DialogTitle>Create Page</DialogTitle>
      <DialogContent>
        <Form id="createPageForm" action={action}>
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
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => router.back()}
        >Cancel</Button>
        <Button
          form="createPageForm"
          type="submit"
        >Create</Button>
      </DialogActions>
    </Dialog>
  )
}
