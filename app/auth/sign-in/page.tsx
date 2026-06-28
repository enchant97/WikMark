"use client"
import { AlertLevel, InlineAlert } from "@/components/InlineAlert"
import NextLink from "@/components/NextLink"
import { authClient } from "@/lib/auth-client"
import { Button, Checkbox, Divider, FormControlLabel, Stack, TextField } from "@mui/material"
import Form from "next/form"
import { useRouter } from "next/navigation"
import { useActionState } from "react"

export default function SignUpPage() {
  const router = useRouter()
  const [signinState, dispatchSignin, signinPending] = useActionState(async (_prevData: unknown, form: FormData) => {
    return await authClient.signIn.email({
      email: form.get("email")?.toString(),
      password: form.get("password")?.toString(),
      rememberMe: form.get("rememberMe")?.toString() === "on",
    }, {
      onSuccess: (_ctx) => {
        router.push("/-/")
      }
    })
  }, null)

  return (
    <>
      <h1>Sign-Up</h1>
      <Form action={dispatchSignin}>
        <Stack spacing={1} sx={{ padding: 1 }}>
          <TextField label="Email" name="email" type="email" autoComplete="username" required fullWidth />
          <TextField label="Password" name="password" type="password" autoComplete="current-password" required fullWidth />
          <FormControlLabel control={<Checkbox name="rememberMe" defaultChecked />} label="Remember Me" />
          {signinState?.error && !signinPending && <InlineAlert message={signinState.error.message} level={AlertLevel.Error} />}
          <Button variant="outlined" type="submit" loading={signinPending}>Sign-In</Button>
          <Button variant="outlined" LinkComponent={NextLink} href="/auth/sign-up">Sign-Up Instead?</Button>
          <Button variant="outlined" LinkComponent={NextLink} href="/">Back Home</Button>
        </Stack>
      </Form>
    </>
  )
}
