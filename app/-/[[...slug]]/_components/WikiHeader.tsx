import { Breadcrumbs, Link } from "@mui/material";
import NextLink from "@/components/NextLink";
import HomeIcon from '@mui/icons-material/Home';

export default function WikiHeader(props: { breadcrumb: string[] }) {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      {/* TODO add aria-current="page" support and primary text color */}
      <Link
        component={NextLink}
        href="/-"
        sx={{ display: 'flex', alignItems: 'center' }}
      ><HomeIcon fontSize="inherit" />
      </Link>
      {props.breadcrumb.map((crumb, i) => (
        <Link component={NextLink} href={`/-/${props.breadcrumb.slice(0, i + 1).join("/")}`}>{crumb}</Link>
      ))}
    </Breadcrumbs>
  )
}
