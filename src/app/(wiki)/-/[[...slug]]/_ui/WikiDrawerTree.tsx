import NextLink from "@/components/NextLink";
import { joinSlugParts } from "@/lib/helpers";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from "@mui/material/ListItemIcon";
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import ListItemText from "@mui/material/ListItemText";
import { type PageTreeEntry } from "@/lib/search/db";

function makeParentTitle(parentTitle: string, slugParts: string[]): string {
  if (parentTitle !== "") {
    return parentTitle
  }
  const parentSlug = slugParts.slice(0, -1).at(-1)
  return parentSlug ?? "Home"
}

interface Props {
  parentTitle: string
  relPageTree: PageTreeEntry[]
  slugParts: string[]
}

export default function WikiDrawerTree({ parentTitle, relPageTree, slugParts }: Props) {
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
            <ListItemText primary={makeParentTitle(parentTitle, slugParts)} />
          </ListItemButton>
        </ListItem>
      )}
      {relPageTree.map(({ slug, title }) => (
        <ListItem key={slug}>
          <ListItemButton
            LinkComponent={NextLink}
            href={`/-/${slug}`}
          ><ListItemText primary={title || slug.slice(slug.lastIndexOf("/") + 1)} /></ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}
