import { Container } from "@mui/material";
import WikiDrawer from "./_ui/WikiDrawer";

export default async function WikiLayout(props: LayoutProps<"/-/[[...slug]]">) {
  return (
    <WikiDrawer>
      <Container>
        {props.children}
      </Container>
    </WikiDrawer>
  )
}
