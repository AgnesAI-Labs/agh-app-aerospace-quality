// Fail when the committed dist/index.js differs from a fresh build of src/.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const temp = mkdtempSync(join(tmpdir(), 'aero-dist-'))
try {
  const out = join(temp, 'index.js')
  const { scripts } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const args = scripts.build.split(' ').slice(1) // `esbuild <args>`; the pinned version comes from the script below
  args[args.indexOf('--outfile=dist/index.js')] = `--outfile=${out}`
  execFileSync('npx', ['--yes', 'esbuild@0.28.2', ...args], { cwd: root, stdio: 'pipe' })
  if (!readFileSync(out).equals(readFileSync(join(root, 'dist/index.js')))) {
    console.error('dist/index.js is stale; run `npm run build` and commit the result')
    process.exit(1)
  }
  console.log('dist/index.js matches src/')
} finally {
  rmSync(temp, { recursive: true, force: true })
}
