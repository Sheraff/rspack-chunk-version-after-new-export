// Starts `rspack serve`, loads the page, appends an export to src/format.js,
// reloads the page and prints what it shows. Exits 1 when the page is broken.
import fs from 'node:fs'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const original = fs.readFileSync('src/format.js', 'utf8')
const server = spawn(process.execPath, ['node_modules/@rspack/cli/bin/rspack.js', 'serve'], { stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''
server.stdout.on('data', (d) => (log += d))
server.stderr.on('data', (d) => (log += d))
const compiled = async (n) => {
  for (let i = 0; i < 600; i++) {
    if ((log.match(/compiled successfully|compiled in/gi) ?? []).length >= n) return
    await sleep(100)
  }
  throw new Error('no compile:\n' + log)
}

let broken = true
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH })
try {
  await compiled(1)
  const url = (log.match(/http:\/\/localhost:\d+/) ?? ['http://localhost:8080'])[0]
  const page = await browser.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(url)
  await sleep(1500)
  console.log('before the edit:', JSON.stringify(await page.textContent('body')))

  fs.appendFileSync('src/format.js', 'export const added = 1\n')
  await compiled(2)
  await sleep(1500)
  errors.length = 0
  await page.reload()
  await sleep(2500)
  const text = (await page.textContent('body')).trim()
  console.log('after the edit, reloaded:', JSON.stringify(text))
  for (const e of errors) console.log('  error:', e)
  broken = text !== 'APP CHUNK'
  console.log(broken ? 'BROKEN (expected "APP CHUNK")' : 'OK')
} finally {
  fs.writeFileSync('src/format.js', original)
  await browser.close()
  server.kill()
}
process.exit(broken ? 1 : 0)
