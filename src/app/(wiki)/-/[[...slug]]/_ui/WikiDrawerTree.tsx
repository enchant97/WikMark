import NextLink from "@/components/NextLink";
import { joinSlugParts } from "@/lib/helpers";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from "@mui/material/ListItemIcon";
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import ListItemText from "@mui/material/ListItemText";

interface Props {
  relSlugs: string[]
  slugParts: string[]
}

export default function WikiDrawerTree({ relSlugs, slugParts }: Props) {
  return (
    <List
      component="nav"
      dense={true}
    >
      {slugParts.length !== 0 && (
        <ListItem key={""}>
          <ListItemButton
            LinkComponent={NextLink}
            href={`/-/${joinSlugParts(slugParts.slice(0, -1))}`}
          >
            <ListItemIcon><SubdirectoryArrowLeftIcon /></ListItemIcon>
            <ListItemText primary={slugParts.at(-2) ?? "Home"} />
          </ListItemButton>
        </ListItem>
      )}
      {relSlugs.map(slug => (
        <ListItem key={slug}>
          <ListItemButton
            LinkComponent={NextLink}
            href={`/-/${joinSlugParts([...slugParts, slug])}`}
          ><ListItemText primary={slug} /></ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}
