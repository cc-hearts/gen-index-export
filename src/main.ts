import { hasOwnProperty } from '@cc-heart/utils'
import { loadConfigFile } from './shard.js'
import { genAbsolutePath } from './path.js'
// parseRelativePath
import { output } from './output.js'
import { getAllFileListMap, parseModuleMap } from './file.js'

import type { IConfig } from '../types/helper'

export async function genExportIndex(argvConfig: IConfig) {
  const fileConfig = await loadConfigFile(argvConfig.config)
  if (fileConfig) {
    const config = fileConfig.default || {}
    argvConfig = { ...config, ...argvConfig }
  }
  if (!hasOwnProperty(argvConfig, 'dirs')) {
    throw new Error('dirs is required')
  }
  const absolutePath = genAbsolutePath(argvConfig)
  const isIgnoreIndexPath = hasOwnProperty(argvConfig, 'ignoreIndexPath')

  const getOutput = async (path: string) => {
    const exportMap = await getAllFileListMap(path)
    return output(parseModuleMap(exportMap, isIgnoreIndexPath))
  }

  const fileMap = new Map<string, string>()
  const stdinSet = new Set<string>()
  await Promise.all(
    absolutePath.map(async (path, index) => {
      const ctx = await getOutput(path)
      const output = argvConfig.dirs[index]?.output || Symbol.for('stdin') // default output stdin
      if (output === Symbol.for('stdin')) {
        stdinSet.add(ctx)
      } else {
        if (typeof output === 'string') fileMap.set(output, ctx)
      }
    })
  )
  return [fileMap, stdinSet]
}
