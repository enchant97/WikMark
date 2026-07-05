"use client";
import { InlineAppErrorAlert, InlineSuccessAlert } from "@/components/InlineAlert"
import { deletePageAction, updatePageSettingsAction } from "@/lib/actions"
import { intoPageSlug } from "@/lib/helpers"
import { useModalNavigation } from "@/lib/ModalNavigationContext"
import Form from "next/form"
import { useRouter } from "next/navigation"
import { startTransition, useActionState, useEffect, useState } from "react"
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export default function SettingsPageModal(props: { fullSlug: string, title: string }) {
  const isHomePath = props.fullSlug === ""
  const { closeAndNavigate } = useModalNavigation()
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [newFullSlug, setNewFullSlug] = useState(props.fullSlug)
  const [updateState, dispatchUpdate, updatePending] = useActionState(updatePageSettingsAction, null)
  const [deleteState, dispatchDelete, deletePending] = useActionState(deletePageAction, null)
  const globalPending = updatePending || deletePending

  useEffect(() => {
    if (deleteState?.success) {
      setOpen(false)
      closeAndNavigate(`/-/${props.fullSlug.split("/").slice(0, -1).join("/")}`)
    } else if (updateState?.success && props.fullSlug !== newFullSlug) {
      setOpen(false)
      closeAndNavigate(`/-/${newFullSlug}`)
    }
  }, [deleteState, updateState])
  const onClose = () => {
    setOpen(false)
    router.back()
  }
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Page Settings</DialogTitle>
      <DialogContent>
        <Form id="settingsPageForm" action={dispatchUpdate}>
          <input
            name="currentFullSlug"
            type="hidden"
            value={props.fullSlug}
          />
          <Stack spacing={1} sx={{ padding: 1 }}>
            <TextField
              name="title"
              label="Title"
              helperText="the title of the page (will display as h1)"
              defaultValue={props.title}
              required
              fullWidth
            />
            {isHomePath
              ? (<>
                <Alert severity="info">Moving the home path is not allowed, so the options have been hidden.</Alert>
                <input
                  name="newFullSlug"
                  type="hidden"
                  value={props.fullSlug}
                />
              </>)
              : (
                <TextField
                  name="newFullSlug"
                  label="Path"
                  helperText="Full path for page (including page slug)"
                  value={newFullSlug}
                  onChange={(ev) => setNewFullSlug(intoPageSlug(ev.currentTarget.value))}
                  required
                  fullWidth
                />
              )
            }
          </Stack>
        </Form>
        {(deleteState?.error && !globalPending) && <InlineAppErrorAlert err={deleteState.error} />}
        {(updateState?.error && !globalPending) && <InlineAppErrorAlert err={updateState.error} />}
        {(updateState?.success && !globalPending) && <InlineSuccessAlert message={"updated page"} />}
      </DialogContent>
      <DialogActions>
        <Button
          disabled={globalPending}
          onClick={onClose}
        >Cancel</Button>
        <Button
          disabled={globalPending}
          loading={updatePending}
          form="settingsPageForm"
          type="submit"
        >Save</Button>
        {!isHomePath &&
          <Button
            loading={deletePending}
            disabled={globalPending}
            color="error"
            onClick={() => {
              startTransition(() => dispatchDelete({
                fullSlug: props.fullSlug,
              }))
            }}
          >Delete</Button>
        }
      </DialogActions>
    </Dialog>
  )
}
