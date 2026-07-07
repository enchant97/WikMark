"use client";
import { InlineSuccessAlert, InlineAppErrorAlert } from "@/components/InlineAlert"
import { deleteAssetAction } from "@/lib/actions"
import { makeFullAssetSlug } from "@/lib/helpers"
import CloudUpload from "@mui/icons-material/CloudUpload"
import DeleteForever from "@mui/icons-material/DeleteForever"
import Form from "next/form"
import { useRouter } from "next/navigation"
import { startTransition, Suspense, use, useActionState, useRef, useState } from "react"
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { ErrorDTO } from "@/lib/errors";

async function uploadAssetAction(_prevState, formData: FormData) {
  const resp = await fetch("/api/upload/assets", {
    method: "POST",
    body: formData,
  })
  if (resp.ok) { return (await resp.json()) as { success: boolean } }
  if (resp.headers.get("Content-Type") === "application/x.wikmark.error+json") {
    return (await resp.json()) as { error: ErrorDTO }
  }
  throw new Error("action failed")
}

export default function AssetsModal(props: { fullSlug: string, assets: Promise<string[]> }) {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [deleteState, dispatchDelete, deletePending] = useActionState(deleteAssetAction, null)
  const [createState, dispatchCreate, createPending] = useActionState(uploadAssetAction, null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const createFormRef = useRef<HTMLFormElement | null>(null)
  const globalPending = deletePending || createPending

  const onClose = () => {
    setOpen(false)
    router.back()
  }

  const onDelete = (assetSlug: string) => {
    setDeleting(assetSlug)
    startTransition(() => dispatchDelete({
      fullSlug: makeFullAssetSlug(props.fullSlug, assetSlug)
    }))
  }

  const ContentInner = () => {
    const assets = use(props.assets)
    return (
      <>
        <Form ref={createFormRef} action={dispatchCreate}>
          <input
            name="parentSlug"
            type="hidden"
            value={props.fullSlug}
          />
          <Button
            component={"label"}
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUpload />}
            loading={createPending}
            disabled={globalPending}
          >
            Upload New Asset
            <input
              type="file"
              name="file"
              onChange={() => { createFormRef.current?.requestSubmit() }}
              required
              hidden
            />
          </Button>
        </Form>
        <Divider />
        <List>
          {assets.map((assetSlug) => (
            <ListItem key={assetSlug}
              secondaryAction={
                <IconButton
                  color="error"
                  onClick={() => onDelete(assetSlug)}
                  loading={deleting === assetSlug && deletePending}
                  disabled={globalPending}
                >
                  <DeleteForever />
                </IconButton>
              }
            >
              <ListItemButton
                href={`/api/raw/${makeFullAssetSlug(props.fullSlug, assetSlug)}`}
                target="_blank"
              >
                <ListItemText>{assetSlug}</ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {(deleteState?.error && !globalPending) && <InlineAppErrorAlert err={deleteState.error} />}
        {(createState?.error && !globalPending) && <InlineAppErrorAlert err={createState.error} />}
        {(deleteState?.success && !globalPending) && <InlineSuccessAlert message={"deleted asset"} />}
        {(createState?.success && !globalPending) && <InlineSuccessAlert message={"added asset"} />}
      </>
    )
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Page Assets</DialogTitle>
      <DialogContent>
        <Suspense fallback={<>
          <Grid sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress aria-label="loading assets" />
          </Grid>
        </>}>
          <ContentInner />
        </Suspense>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={globalPending}
        >Close</Button>
      </DialogActions>
    </Dialog>
  )
}
