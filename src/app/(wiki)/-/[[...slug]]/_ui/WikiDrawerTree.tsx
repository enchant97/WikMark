import NextLink from "@/components/NextLink";
import { joinSlugParts } from "@/lib/helpers";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from "@mui/material/ListItemIcon";
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import ListItemText from "@mui/material/ListItemText";
import { type PageTreeEntry } from "@/lib/search/db";

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
            <ListItemText primary={parentTitle === "" ? (slugParts.length === 0 ? "Home" : slugParts.at(-1)) : parentTitle} />
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
