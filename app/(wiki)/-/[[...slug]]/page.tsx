import { getPageContentParts } from "@/lib/data/page"
import { joinSlugParts } from "@/lib/helpers"
import { HeaderMenu } from "@/components/WikiHeader"
import { ButtonGroup } from "@mui/material"
import { EditDocument, NoteAdd, PermMedia, Settings } from "@mui/icons-material"
import NextLink from "@/components/NextLink"
import RenderedPageServer from "./_ui/RenderedPageServer"
import env from "@/env"
import dynamic from "next/dynamic"
import ResponsiveButton from "@/components/ResponsiveButton"

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
          <ResponsiveButton startIcon={<NoteAdd />} LinkComponent={NextLink} href={`/new/${fullSlug}`}>New</ResponsiveButton>
          <ResponsiveButton startIcon={<Settings />} LinkComponent={NextLink} href={`/settings/${fullSlug}`}>Settings</ResponsiveButton>
          <ResponsiveButton startIcon={<PermMedia />} LinkComponent={NextLink} href={`/assets/${fullSlug}`}>Assets</ResponsiveButton>
          <ResponsiveButton startIcon={<EditDocument />} LinkComponent={NextLink} href={`/edit/${fullSlug}`}>Edit</ResponsiveButton>
        </ButtonGroup>
      </HeaderMenu>
      {env.NEXT_PUBLIC_ENABLE_CLIENT_RENDERING
        ? <RenderedPageClient content={pageContentParts.content} title={pageTitle} />
        : <RenderedPageServer content={pageContentParts.content} title={pageTitle} />
      }
    </>
  )
}
