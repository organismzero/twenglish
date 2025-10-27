import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const root = process.cwd()
const outDir = join(root, 'out')
const publicDir = join(root, 'public')

function ensureDir(path) {
  try {
    mkdirSync(path, { recursive: true })
  } catch {}
}

function copyIfExists(filename) {
  const source = join(publicDir, filename)
  const destination = join(outDir, filename)
  if (!existsSync(source) || !existsSync(outDir)) return
  ensureDir(dirname(destination))
  copyFileSync(source, destination)
  // eslint-disable-next-line no-console
  console.log(`Copied ${filename} to out/`)
}

if (existsSync(outDir)) {
  copyIfExists('CNAME')

  const noJekyllPath = join(outDir, '.nojekyll')
  if (!existsSync(noJekyllPath)) {
    writeFileSync(noJekyllPath, '')
    // eslint-disable-next-line no-console
    console.log('Created .nojekyll in out/')
  }
}
