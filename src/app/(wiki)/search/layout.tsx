import WikiHeader from "@/components/WikiHeader";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';

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
