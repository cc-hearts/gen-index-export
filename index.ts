import { argvTranslateConfig, outputFile } from './src/shard.js'
import type { IConfig } from './types/helper'

import { genExportIndex } from './src/main.js'

// TODO: 命令行只能有一个 后续优化
async function bootstrap() {
  let argvConfig = argvTranslateConfig<IConfig>()
  const [fileMap, stdinSet] = await genExportIndex(argvConfig)
  for (const [path, ctx] of fileMap) {
    outputFile(path, ctx)
  }
  if (stdinSet.size > 0)
    for (const ctx of stdinSet) {
      console.log(ctx)
    }
}

bootstrap()
