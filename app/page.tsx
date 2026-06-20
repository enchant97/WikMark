import Button from "@mui/material/Button";
import NextLink from "@/components/NextLink";
import env from "@/env";
import { redirect } from "next/navigation";

export default function Home() {
  if (env.NEXT_PUBLIC_ENABLE_LANDING) {
    return (
      <Button LinkComponent={NextLink} href={"/-"} variant="contained">Enter Wiki</Button>
    );
  }
  redirect("/-")
}
