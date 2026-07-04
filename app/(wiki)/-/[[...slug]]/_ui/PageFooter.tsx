import { PageMetadata } from "@/lib/types";
import { Box, Divider, Link, Stack, Typography } from "@mui/material";

export default function PageFooter(props: { metadata: PageMetadata }) {
  return (
    <Box component={"footer"} sx={{ paddingTop: 4 }}>
      <Stack spacing={1}>
        <Divider flexItem />
        <Stack direction={"row"} sx={{ justifyContent: "space-between" }}>
          <Typography variant="body2">
            <span>Updated At: </span>
            <time dateTime={props.metadata.updatedAt}>{props.metadata.updatedAt}</time>
          </Typography>
          <Typography variant="body2">
            <span>Powered By: </span>
            <Link href="#">WIKI</Link>
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}
