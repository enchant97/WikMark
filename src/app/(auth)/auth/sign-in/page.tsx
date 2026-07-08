import env from "@/env";
import SigninInner from "./_ui/SigninInner";

export default async function SignInPage() {
  return (
    <>
      <h1>Sign-In</h1>
      <SigninInner enableSignup={env.ENABLE_SIGNUP} />
    </>
  )
}
