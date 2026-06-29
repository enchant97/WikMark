import { AppBar, Box, Container, Toolbar } from "@mui/material";
import WikiHeader from "@/components/WikiHeader"

export default async function WikiEditorLayout(props: LayoutProps<"/edit/[[...slug]]">) {
  const { slug } = await props.params
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
