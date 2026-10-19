# INSTALL

## Deployment Notes
- WikMark performs no body size limits on requests, so you should put it behind a reverse-proxy that can
- Designed to only be deployed in a standalone node environment

## Configuration
Application configurations specified as environment variables.

> Defaults shown here; assumes using the Docker deployment

| Name | Description | Default |
| :--  | :---------- | :------ |
| HOSTNAME | Where to listen for requests | 0.0.0.0 |
| PORT | What port to listen on | 8080 |
| WIKI_PATH | Where the wiki pages/assets are stored | `/opt/wikmark/data/wiki` |
| DB_PATH | main database filepath | `/opt/wikmark/data/db.sqlite` |
| SEARCH_DB_PATH | Search index database filepath | `/opt/wikmark/data/search.db.sqlite` |
| AUTH_SECRET | The authentication secret, base64 >=32 | |
| META_TITLE | Wiki title shown in HTML meta | - |
| META_DESCRIPTION | Wiki description shown in HTML meta | - |
| ENABLE_PAGE_TITLE | Whether to show a page title `<h1>` on every wiki page | true |
| ENABLE_SIGNUP | Allow new user signups | true |
| ENABLE_CLIENT_RENDERING | Render markdown on client instead of server | false |
| PUBLIC_URL | Where site will be accessed from | |
