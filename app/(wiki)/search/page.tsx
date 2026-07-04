import { getSearchResults } from "@/lib/actions"
import { Suspense } from "react"
import { CircularProgress, Grid } from "@mui/material"
import SearchBox from "./_ui/SearchBox"
import SearchResults from "./_ui/SearchResults"
import { processRawQuery } from "./_lib"

export default async function WikiSearchPage(props: PageProps<"/search">) {
  const { q } = await props.searchParams
  const initialQuery = processRawQuery(q)
  const searchResults = async () => {
    if (!initialQuery) { return null }
    return await getSearchResults(initialQuery)
  }
  return (
    <>
      <h1>Search</h1>
      <SearchBox initialQuery={initialQuery} />
      <Suspense fallback={
        <Grid sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
          <CircularProgress aria-label="loading search results" />
        </Grid>
      }>
        <SearchResults searchResultsAction={searchResults()} />
      </Suspense>
    </>
  )
}
