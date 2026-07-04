import { auth } from "@/lib/auth";
import { Container } from "@mui/material";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function AuthLayout(props: PropsWithChildren) {
  const authSession = await auth.api.getSession({
    headers: await headers()
  })
  if (authSession) {
    redirect("/-")
  }
  return (
    <Container maxWidth={"sm"}>
      {props.children}
    </Container>
  )
}
