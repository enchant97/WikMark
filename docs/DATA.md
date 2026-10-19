# DATA

- Page content is stored in a standard file/folder system, stored at: `WIKI_PATH`
- User profiles are stored in a SQLite database at: `DB_PATH`
- Search index is stored in a SQLite database at: `SEARCH_DB_PATH`, this is safe to delete and will regenerate on startup

Page content is structured in the following way:

```
${WIKI_PATH}/
    _index.md <--- Wiki Home Page
    asset.jpg
    my-path.md
    my-path/
        amazing-page.md
        another-asset.pdf
```
