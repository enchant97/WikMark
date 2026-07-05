"use client";
import { AlertLevel, InlineAlert } from "@/components/InlineAlert"
import NextLink from "@/components/NextLink"
import env from "@/env"
import { authClient } from "@/lib/auth-client"
import Form from "next/form"
import { redirect, useRouter } from "next/navigation"
import { useActionState } from "react"
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export default function SignUpPage() {
  if (!env.NEXT_PUBLIC_ENABLE_SIGNUP) {
    redirect("/auth/sign-in")
  }
  const router = useRouter()
  const [signupState, dispatchSignup, signupPending] = useActionState(async (_prevData: unknown, form: FormData) => {
    return await authClient.signUp.email({
      email: form.get("email")?.toString(),
      password: form.get("password")?.toString(),
      name: form.get("name")?.toString(),
    }, {
      onSuccess: (_ctx) => {
        router.push("/-/")
      }
    })
  }, null)

  return (
    <>
      <h1>Sign-Up</h1>
      <Form action={dispatchSignup}>
        <Stack spacing={1} sx={{ padding: 1 }}>
          <TextField label="Name" name="name" autoComplete="name" required fullWidth />
          <TextField label="Email" name="email" type="email" autoComplete="username" required fullWidth />
          <TextField label="Password" name="password" type="password" autoComplete="new-password" required fullWidth />
          {signupState?.error && !signupPending && <InlineAlert message={signupState.error.message} level={AlertLevel.Error} />}
          <Button variant="outlined" type="submit" loading={signupPending}>Sign-Up</Button>
          <Button variant="outlined" LinkComponent={NextLink} href="/auth/sign-in">Sign-In Instead?</Button>
          <Button variant="outlined" LinkComponent={NextLink} href="/-">Back Home</Button>
        </Stack>
      </Form>
    </>
  )
}
