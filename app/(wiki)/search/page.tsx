import SearchBox from "./_ui/SearchBox"

export default async function WikiSearchPage(props: PageProps<"/search">) {
  const { q } = await props.searchParams
  const initialQuery = (q instanceof Array
    ? q.at(0) ?? ""
    : q ?? "").trim()
  return (
    <>
      <h1>Search</h1>
      <SearchBox initialQuery={initialQuery} />
    </>
  )
}
