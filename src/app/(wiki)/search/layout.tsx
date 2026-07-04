import WikiHeader from "@/components/WikiHeader";
import { AppBar, Box, Container, Toolbar } from "@mui/material";

export default async function WikiSearchLayout(props: LayoutProps<"/search">) {
  return (<>
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
      >
        <Toolbar>
          <WikiHeader breadcrumb={[]} />
        </Toolbar>
      </AppBar>
      <Container>
        <Toolbar />
        {props.children}
      </Container>
    </Box>
  </>)
}
