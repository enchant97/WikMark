import Header from "@/components/Header";
import WikiHeader from "@/components/WikiHeader";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';

export default async function WikiSearchLayout(props: LayoutProps<"/search">) {
  return (<>
    <Box sx={{ display: 'flex' }}>
      <Header
        position="fixed"
      >
        <Toolbar>
          <WikiHeader breadcrumb={[]} />
        </Toolbar>
      </Header>
      <Container>
        <Toolbar />
        {props.children}
      </Container>
    </Box>
  </>)
}
