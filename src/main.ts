import type { IConfig } from '../types/helper'
import loadArgvConfig, { initHelp } from './command.js'
import { getAllFileListMap, parseModuleMap } from './file.js'
import { formatOutput } from './output.js'

const getOutput = async (dir: IConfig['dirs'][number]) => {
  const exportMap = await getAllFileListMap(dir)
  return formatOutput(parseModuleMap(exportMap, dir.parser))
}

export async function genExportIndex() {
  initHelp()
  const argvConfig = await loadArgvConfig()
  // const isIgnoreIndexPath = hasOwn(argvConfig, 'ignoreIndexPath')
  const fileMap = new Map<string, string>()
  const stdinSet = new Set<string>()
  const { dirs = [] } = argvConfig
  await Promise.all(
    dirs.map(async (dir, index) => {
      const ctx = await getOutput(dir)
      const output = argvConfig.dirs[index]?.output || Symbol.for('stdin')

      if (output === Symbol.for('stdin')) {
        stdinSet.add(ctx)
      } else {
        if (typeof output === 'string') fileMap.set(output, ctx)
      }
    }),
  )
  return [fileMap, stdinSet]
}
