import { Breadcrumbs, Link } from "@mui/material";
import NextLink from "@/components/NextLink";
import HomeIcon from '@mui/icons-material/Home';
import { joinSlugParts } from "../_lib/helpers";

export default function WikiHeader(props: { breadcrumb: string[] }) {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      {/* TODO add aria-current="page" support and primary text color */}
      <Link
        color="inherit"
        underline="hover"
        component={NextLink}
        href="/-"
        sx={{ display: 'flex', alignItems: 'center' }}
      ><HomeIcon fontSize="inherit" />
      </Link>
      {props.breadcrumb.map((crumb, i) => (
        <Link color="inherit" underline="hover" component={NextLink} href={`/-/${joinSlugParts(props.breadcrumb.slice(0, i + 1))}`}>{crumb}</Link>
      ))}
    </Breadcrumbs>
  )
}
