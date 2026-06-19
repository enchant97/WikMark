import { Button } from "@mui/material";
import Link from "next/link";

export default function Header() {
  return (
    <Button LinkComponent={Link} href={"/"}>Wiki</Button>
  )
}
