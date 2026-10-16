import NextLink from "@/components/NextLink";
import { PageMetadata } from "@/lib/types";
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuBookIcon from '@mui/icons-material/MenuBook';

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
            <Link href="https://github.com/enchant97/WikMark" target="_blank">WikMark</Link>
          </Typography>
        </Stack>
        <Box
          sx={{ textAlign: "center" }}
        >
          <Button
            href="/reader/-"
            variant="outlined"
            startIcon={<MenuBookIcon />}
            LinkComponent={NextLink}
          >WikMark Reader</Button>
        </Box>
      </Stack>
    </Box>
  )
}
