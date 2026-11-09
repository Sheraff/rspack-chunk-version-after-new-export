# rspack: page breaks after a shared module gains an export

Reproduction for an Rspack issue (link added once filed).

```sh
npm install
npx playwright install chromium   # or set CHROME_PATH
npm run repro                     # exits 1 on @rspack/core 2.3.1
```

`npm run repro` starts `rspack serve`, loads the page (`APP CHUNK`), appends
`export const added = 1` to `src/format.js`, reloads the page and prints what it shows.

On @rspack/core 2.3.1 the reloaded page is blank: `main.<hash>.hot-update.json` 404, then
`Chunk is from another build, and no update leads to it`. Every later load fails until the
server restarts.

Control: `npm install -D @rspack/core@2.3.0 && npm run repro` prints `OK`.

Manual: `npm run dev`, open the page, append the export to `src/format.js`, reload.
