import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

// The tests consume @agnes/* source packages that are not published; they are read from a local checkout
// of the open-source repo (AGNES_HARNESS, default ~/agnes-harness) and resolved through each package's "exports".
const harness = process.env.AGNES_HARNESS ?? join(homedir(), 'agnes-harness')
const webUi = `${harness}/packages/web-ui/node_modules`

const harnessPackages = {
  name: 'agnes-harness-packages',
  enforce: 'pre',
  resolveId(source) {
    const m = /^@agnes\/([^/]+)(\/.*)?$/.exec(source)
    const manifest = m && join(harness, 'packages', m[1], 'package.json')
    if (!manifest || !existsSync(manifest)) return null
    let target = JSON.parse(readFileSync(manifest, 'utf8')).exports?.[m[2] ? `.${m[2]}` : '.']
    if (target && typeof target === 'object') target = target.default
    return typeof target === 'string' ? join(harness, 'packages', m[1], target) : null
  },
}

export default {
  plugins: [harnessPackages],
  resolve: {
    alias: [
      { find: '@sinclair/typebox', replacement: `${harness}/packages/extension-api/node_modules/@sinclair/typebox` },
      { find: /^react(-dom)?(\/.*)?$/, replacement: `${webUi}/react$1$2` },
    ],
  },
  server: { fs: { allow: [harness, '.'] } },
  // 15s matches the open-source repo's macOS/Windows default.
  test: { include: ['test/**/*.test.ts'], testTimeout: 15_000 },
}
