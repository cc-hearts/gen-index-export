#!/usr/bin/env node
import { writeOutputFile } from './src/shard.js'
import { genExportIndex } from './src/main.js'

async function bootstrap() {
  const [fileMap, stdinSet] = await genExportIndex()
  for (const [path, ctx] of fileMap) {
    writeOutputFile(path, ctx)
  }
  if (stdinSet.size > 0)
    for (const ctx of stdinSet) {
      console.log(ctx)
    }
}

bootstrap()
