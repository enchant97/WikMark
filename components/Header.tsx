import { Button } from "@mui/material";
import NextLink from "@/components/NextLink";

export default function Header() {
  return (
    <Button LinkComponent={NextLink} href={"/"}>Home</Button>
  )
}
