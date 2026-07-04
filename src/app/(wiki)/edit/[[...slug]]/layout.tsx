import { AppBar, Box, Container, Toolbar } from "@mui/material";
import WikiHeader from "@/components/WikiHeader"
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { joinSlugParts } from "@/lib/helpers";
import { auth } from "@/lib/auth";

export default async function WikiEditorLayout(props: LayoutProps<"/edit/[[...slug]]">) {
  const { slug } = await props.params
  const authSession = await auth.api.getSession({
    headers: await headers()
  })
  if (!authSession) {
    redirect(`/-/${joinSlugParts(slug)}`)
  }
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
      >
        <Toolbar>
          <WikiHeader breadcrumb={slug ?? []} />
        </Toolbar>
      </AppBar>
      <Container>
        <Toolbar />
        {props.children}
      </Container>
    </Box>
  )
}
