import { Container } from "@mui/material";
import { PropsWithChildren } from "react";

export default function AuthLayout(props: PropsWithChildren) {
  return (
    <Container maxWidth={"sm"}>
      {props.children}
    </Container>
  )
}
