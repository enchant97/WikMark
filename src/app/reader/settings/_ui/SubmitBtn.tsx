"use client"

import { useFormStatus } from "react-dom"

export default function SubmitBtn() {
  const status = useFormStatus()
  return (
    <button
      className="btn"
      style={{ "marginTop": "0.6rem" }}
      type="submit"
    >{status.pending ? "Saving..." : "Save"}</button>
  )
}
