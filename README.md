# WikMark
Performant markdown based wiki. Storing data on the standard file-system, ensuring data portability.

> [!CAUTION]
> Very experimental, data-loss may occur! You have been warned.

> See my app [Note Mark](https://github.com/enchant97/note-mark) for a markdown based notes app.

## Features
- Store content on the file-system
- Hierarchical Organization
- Store attachments
- Single wiki area - all content accessible by all users
- Visual markdown editor
- Full-Text Search
- User accounts

## FAQ
Why another wiki app?

There is quite a selection that already exist, but I am yet to find one that has the following features: simple to use, loads pages fast on lower-end machines (sub 500ms), supports markdown and stores it normally on the file-system, ensuring data portability.

Why Next.JS?

Unlike most of my other projects where I have used less-established tech I wanted to learn a system used by many businesses. I also want to see how optimised it can get for being such a large and complex framework.

## Data
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
| ENABLE_SIGNUP | Allow new user signups | true |
| ENABLE_CLIENT_RENDERING | Render markdown on client instead of server | false |
| PUBLIC_URL | Where site will be accessed from | |

## Roadmap
[View here](ROADMAP.md)

## Support Me
Like this project? Consider supporting me financially so I can continue development.

<a href="https://www.buymeacoffee.com/leospratt" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" height=60></a>

## Contributing
Currently not accepting feature code contributions, however you may: fix bugs (as long as they are reported first), report bugs and offer ideas.

## License
This project is Copyright (c) 2026 Leo Spratt, licences shown below:

Code

    AGPL-3.0. Full license found in `LICENSE.txt`

Icon / Mark

    All Rights Reserved
