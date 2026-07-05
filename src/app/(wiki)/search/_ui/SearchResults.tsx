import NextLink from "@/components/NextLink";
import { SearchResult } from "@/lib/search/db";
import { use } from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function SearchResults(props: {
  searchResultsAction: Promise<SearchResult[] | null>
}) {
  const searchResults = use(props.searchResultsAction)

  if (searchResults === null) {
    return <p>Enter a search query to start.</p>
  }

  if (searchResults.length === 0) {
    return <p>No results found.</p>
  }

  return (
    <List>
      {searchResults !== null && searchResults.map((result) => (
        <ListItem key={result.slug}>
          <ListItemButton LinkComponent={NextLink} href={`/-/${result.slug}`}>
            <Stack>
              <Typography variant="subtitle1">{result.title || "-"}</Typography>
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>{result.slug || "_index"}</Typography>
              <Typography variant="body2">
                <span dangerouslySetInnerHTML={{ __html: result.excerpt }} />
              </Typography>
            </Stack>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}
