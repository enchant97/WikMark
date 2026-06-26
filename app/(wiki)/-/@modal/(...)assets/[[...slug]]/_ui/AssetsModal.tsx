"use client"

import { createAssetAction, deleteAssetAction } from "@/lib/actions"
import { makeFullAssetSlug } from "@/lib/helpers"
import { CloudUpload, DeleteForever } from "@mui/icons-material"
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, List, ListItem, ListItemButton, ListItemText } from "@mui/material"
import Form from "next/form"
import { useRouter } from "next/navigation"
import { startTransition, Suspense, use, useActionState, useRef, useState } from "react"

export default function AssetsModal(props: { fullSlug: string, assets: Promise<string[]> }) {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [_deleteState, dispatchDelete, deletePending] = useActionState(deleteAssetAction, null)
  const [_createState, dispatchCreate, createPending] = useActionState(createAssetAction, null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const createFormRef = useRef<HTMLFormElement | null>(null)

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
        >Close</Button>
      </DialogActions>
    </Dialog>
  )
}
