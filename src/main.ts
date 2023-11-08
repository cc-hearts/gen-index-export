import { hasOwn } from '@cc-heart/utils'
import type { IConfig, IOutputConfig } from '../types/helper'
import loadArgvConfig, { initHelp } from './command.js'
import { getAllFileListMap, parseModuleMap } from './file.js'
import { output } from './output.js'
import { genModulesAbsolutePath } from './path.js'
import { getOutputAbsolutePath } from './shard.js'

export async function genExportIndex() {
  initHelp()
  const argvConfig = await loadArgvConfig()
  const absolutePath = genModulesAbsolutePath(argvConfig)
  const isIgnoreIndexPath = hasOwn(argvConfig, 'ignoreIndexPath')

  const getOutput = async (
    path: string,
    argv: IConfig,
    outputConfig: IOutputConfig
  ) => {
    const outputAbsolutePath = getOutputAbsolutePath(argv)
    const exportMap = await getAllFileListMap(
      path,
      outputAbsolutePath,
      outputConfig
    )
    return output(parseModuleMap(exportMap, isIgnoreIndexPath))
  }

  const fileMap = new Map<string, string>()
  const stdinSet = new Set<string>()
  await Promise.all(
    absolutePath.map(async (path, index) => {
      const recursive = argvConfig.recursive || false
      const ctx = await getOutput(path, argvConfig, { recursive })
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
