import { writeFile } from 'fs/promises'
import { resolve } from 'path'
;(() => {
  writeFile(
    resolve(process.cwd(), './dist/bin/scripts.mjs'),
    `#!/usr/bin/env node\t\nimport './index.js'`,
    'utf8',
  )
})()
