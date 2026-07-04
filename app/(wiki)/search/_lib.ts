export function processRawQuery(q: string | string[] | undefined) {
  return (q instanceof Array
    ? q.at(0) ?? ""
    : q ?? "").trim()
}
