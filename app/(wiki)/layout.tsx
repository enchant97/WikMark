import React from "react";
import { HeaderMenuProvider } from "./_ui/WikiHeader";
import { Container } from "@mui/material";
import WikiDrawer from "./_ui/WikiDrawer";

export default async function WikiLayout(props: {
  children: React.ReactNode,
}) {
  return (
    <HeaderMenuProvider>
      <WikiDrawer>
        <Container>
          {props.children}
        </Container>
      </WikiDrawer>
    </HeaderMenuProvider>
  )
}
