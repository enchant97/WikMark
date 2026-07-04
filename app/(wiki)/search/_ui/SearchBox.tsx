"use client"

import NextLink from "@/components/NextLink";
import { getSearchResultsAction } from "@/lib/actions";
import { CircularProgress, Grid, List, ListItem, ListItemButton, Stack, TextField, Typography } from "@mui/material";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";

interface Props {
  initialQuery: string
}

// TODO don't show prev query results when pending
export default function SearchBox({ initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const cooldownTimer = useRef<number | undefined>();
  const [results, dispatchSearch, isSearchPending] = useActionState(getSearchResultsAction, null)

  useEffect(() => {
    clearTimeout(cooldownTimer.current);
    const newQuery = query.trim()
    if (!newQuery) return
    cooldownTimer.current = setTimeout(async () => {
      startTransition(() => dispatchSearch({ query: newQuery }))
    }, 150);
  }, [query]);

  return (
    <>
      <TextField
        label={"Search Query"}
        value={query}
        onChange={(ev) => setQuery(ev.currentTarget.value)}
        fullWidth
      />
      {isSearchPending
        ? <>
          <Grid sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
            <CircularProgress aria-label="loading search results" />
          </Grid>
        </>
        : <>
          <List>
            {query && results?.map((result) => (
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
        </>
      }

    </>
  )
}
