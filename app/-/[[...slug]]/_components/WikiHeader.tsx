import { Breadcrumbs, Button, ButtonGroup, Link } from "@mui/material";
import NextLink from "@/components/NextLink";
import HomeIcon from '@mui/icons-material/Home';
import { joinSlugParts } from "../_lib/helpers";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { EditDocument } from "@mui/icons-material";

export default function WikiHeader(props: { breadcrumb: string[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )
  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ flexGrow: 1 }}>
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
      <ButtonGroup>
        {searchParams.get("mode") === "edit"
          ? <Button LinkComponent={NextLink} href={pathname}>Cancel</Button>
          : <Button startIcon={<EditDocument />} LinkComponent={NextLink} href={pathname + '?' + createQueryString('mode', 'edit')}>Edit</Button>
        }
      </ButtonGroup>
    </>
  )
}
