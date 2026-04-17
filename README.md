# whatsapp-sticker-cli

A small CLI tool to create and manage WhatsApp sticker packs from media files using WhatsApp Web automation.

## Features
- Convert images and GIFs into WhatsApp-compatible stickers
- Manage sessions and persistent browser profiles
- Outputs sticker pack metadata to `output/sticker-pack.json`

## Requirements
- Node.js 16+ and npm
- A Chromium/Chrome binary (used by Puppeteer; the bundled Chromium is used by default)
- ffmpeg (optional; `ffmpeg-static` is included for convenience)

## Install
1. Clone the repo

```bash
git clone <repo-url>
cd whatsapp-sticker-cli
```

2. Install dependencies

```bash
npm install
```

## Run
- Development (auto-restarts on changes):

```bash
npm run dev
```

- Run once:

```bash
node index.js
```

## Configuration
- `config.json` (optional): keep project-level configuration such as input/output folders, quality settings, or Puppeteer options.
- `sessions/` folder: stores browser session data (used to keep WhatsApp Web logged in between runs).
- `output/` folder: generated sticker packs and metadata are written to `output/sticker-pack.json`.

## Docker
This project includes a `Dockerfile` and `docker-compose.yml` for running in a container. Example:

```bash
docker-compose up --build
```

Note: You may need to mount the `sessions/` and `output/` directories to preserve state.

## Development notes
- The CLI uses `puppeteer` and `whatsapp-web.js` for automating and interacting with WhatsApp Web.
- Use `npm run dev` while developing to auto-reload with `nodemon`.

## Contributing
Feel free to open issues or PRs. Keep changes focused and add tests where appropriate.

## License
This project is licensed under the ISC License.
