import { getPageContentParts } from "@/lib/data"
import { joinSlugParts } from "@/lib/helpers"
import { HeaderMenu } from "../../_ui/WikiHeader"
import { Button, ButtonGroup } from "@mui/material"
import { EditDocument, NoteAdd, Settings } from "@mui/icons-material"
import NextLink from "@/components/NextLink"
import RenderedPageServer from "./_ui/RenderedPageServer"
import env from "@/env"
import dynamic from "next/dynamic"

const RenderedPageClient = dynamic(() => import("./_ui/RenderedPageClient"))

export default async function WikiViewPage(props: PageProps<"/-/[[...slug]]">) {
  const { slug } = await props.params
  const fullSlug = joinSlugParts(slug)
  const pageContentParts = await getPageContentParts(fullSlug)
  const pageTitle = pageContentParts.metadata?.title ?? (slug?.at(-1) ?? "Home")

  return (
    <>
      <HeaderMenu>
        <ButtonGroup>
          <Button startIcon={<NoteAdd />} LinkComponent={NextLink} href={`/new/${fullSlug}`}>New</Button>
          <Button startIcon={<Settings />} LinkComponent={NextLink} href={`/settings/${fullSlug}`}>Settings</Button>
          <Button startIcon={<EditDocument />} LinkComponent={NextLink} href={`/edit/${fullSlug}`}>Edit</Button>
        </ButtonGroup>
      </HeaderMenu>
      {env.NEXT_PUBLIC_ENABLE_CLIENT_RENDERING
        ? <RenderedPageClient content={pageContentParts.content} title={pageTitle} />
        : <RenderedPageServer content={pageContentParts.content} title={pageTitle} />
      }
    </>
  )
}
