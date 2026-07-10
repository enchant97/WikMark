# API
WikMark also provides a public REST API for external application usage.

## Get Page Tree
Use this to explore the available wiki pages.

- Method: `GET`
- Route: `${PUBLIC_URL}/api/explore/page-tree/-/${FULL_SLUG}`
- Returns: a JSON string array of page slugs, relative to given full slug

## Get Asset Tree
Use this to discover available assets for a given wiki page.

- Method: `GET`
- Route: `${PUBLIC_URL}/api/explore/asset-tree/-/${FULL_SLUG}`
- Returns: a JSON string array of asset slugs, relative to given full slug
