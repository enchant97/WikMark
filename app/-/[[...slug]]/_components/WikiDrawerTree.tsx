import NextLink from "@/components/NextLink";
import { List, ListItem, ListItemButton } from "@mui/material";
import { joinSlugParts } from "../_lib/helpers";

interface Props {
  relSlugs: string[]
  slugParts: string[]
}

export default function WikiDrawerTree({ relSlugs, slugParts }: Props) {
  return (
    <List>
      {relSlugs.map(slug => (
        <ListItem key={slug}>
          <ListItemButton
            LinkComponent={NextLink}
            href={`/-/${joinSlugParts([...slugParts, slug])}`}
          >{slug}</ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}
