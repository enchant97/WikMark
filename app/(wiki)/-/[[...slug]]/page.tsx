import { getPageContentAsHTML } from "@/lib/data"
import { joinSlugParts } from "@/lib/helpers"
import { HeaderMenu } from "../../_ui/WikiHeader"
import { Button, ButtonGroup } from "@mui/material"
import { EditDocument, NoteAdd, Settings } from "@mui/icons-material"
import NextLink from "@/components/NextLink"

export default async function WikiViewPage(props: PageProps<"/-/[[...slug]]">) {
  const { slug } = await props.params
  const fullSlug = joinSlugParts(slug)
  const pageContent = await getPageContentAsHTML(fullSlug)

  return (
    <>
      <HeaderMenu>
        <ButtonGroup>
          <Button startIcon={<NoteAdd />} LinkComponent={NextLink} href={`/new/${fullSlug}`}>New</Button>
          <Button startIcon={<Settings />} LinkComponent={NextLink} href={`/settings/${fullSlug}`}>Settings</Button>
          <Button startIcon={<EditDocument />} LinkComponent={NextLink} href={`/edit/${fullSlug}`}>Edit</Button>
        </ButtonGroup>
      </HeaderMenu>
      <h1>Wiki Page</h1>
      <div dangerouslySetInnerHTML={{ __html: pageContent }}></div>
    </>
  )
}
