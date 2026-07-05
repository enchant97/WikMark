"use client";
import Search from "@mui/icons-material/Search";
import { useFormStatus } from "react-dom";
import IconButton from '@mui/material/IconButton';

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
