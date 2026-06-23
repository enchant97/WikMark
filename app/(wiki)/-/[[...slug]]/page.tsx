import { getPageContentParts } from "@/lib/data"
import { joinSlugParts } from "@/lib/helpers"
import { HeaderMenu } from "../../_ui/WikiHeader"
import { Button, ButtonGroup, Skeleton, Typography } from "@mui/material"
import { EditDocument, NoteAdd, Settings } from "@mui/icons-material"
import NextLink from "@/components/NextLink"
import MarkdownRendered from "@/components/MarkdownRendered"
import { Suspense } from "react"

export default async function WikiViewPage(props: PageProps<"/-/[[...slug]]">) {
  const { slug } = await props.params
  const fullSlug = joinSlugParts(slug)
  const pageContentParts = await getPageContentParts(fullSlug)

  return (
    <>
      <HeaderMenu>
        <ButtonGroup>
          <Button startIcon={<NoteAdd />} LinkComponent={NextLink} href={`/new/${fullSlug}`}>New</Button>
          <Button startIcon={<Settings />} LinkComponent={NextLink} href={`/settings/${fullSlug}`}>Settings</Button>
          <Button startIcon={<EditDocument />} LinkComponent={NextLink} href={`/edit/${fullSlug}`}>Edit</Button>
        </ButtonGroup>
      </HeaderMenu>
      <Suspense fallback={<>
        <Typography variant="h1">
          <Skeleton />
        </Typography>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </>}>
        {/* hiding the header until content load is a stylistic choice */}
        <h1>{pageContentParts.metadata?.title ?? (slug?.at(-1) ?? "Home")}</h1>
        <MarkdownRendered md={pageContentParts.content} />
      </Suspense>
    </>
  )
}
