import WikiHeader from "@/components/WikiHeader"
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { joinSlugParts } from "@/lib/helpers";
import { auth } from "@/lib/auth";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';

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
