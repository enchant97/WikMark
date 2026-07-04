import { Stack, TextField } from "@mui/material";
import Form from "next/form";
import SearchButton from "./SearchButton";

export default function SearchBox({ initialQuery }: {
  initialQuery: string
}) {
  return (
    <Form action={"/search"}>
      <Stack direction={"row"} spacing={1}>
        <TextField
          name="q"
          defaultValue={initialQuery}
          label={"Search Query"}
          fullWidth
        />
        <SearchButton />
      </Stack>
    </Form>
  )
}
