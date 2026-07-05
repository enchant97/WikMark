import NextLink from "@/components/NextLink";
import { joinSlugParts } from "@/lib/helpers";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';

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
