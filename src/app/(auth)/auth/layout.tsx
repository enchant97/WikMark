import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import Container from '@mui/material/Container';

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
