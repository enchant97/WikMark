"use client"

import { Search } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useFormStatus } from "react-dom";

export default function SearchButton() {
  const status = useFormStatus()
  return (
    <IconButton
      type="submit"
      loading={status.pending}
    ><Search />
    </IconButton>
  )
}
