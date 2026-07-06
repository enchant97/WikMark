"use client";
import env from "@/env"
import { redirect } from "next/navigation";
import SignUpInner from "./_ui/SignupInner";

export default function SignUpPage() {
  if (!env.ENABLE_SIGNUP) {
    redirect("/auth/sign-in")
  }

  return (
    <>
      <h1>Sign-Up</h1>
      <SignUpInner />
    </>
  )
}
