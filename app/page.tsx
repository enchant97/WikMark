import Button from "@mui/material/Button";
import NextLink from "@/components/NextLink";

export default function Home() {
  return (
    <Button LinkComponent={NextLink} href={"/-"} variant="contained">Enter Wiki</Button>
  );
}
