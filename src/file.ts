import glob from 'glob'
import { basename, extname, relative } from 'path'
import type { IExport, IOutputConfig } from '../types/helper.js'
import { EXPORT_SUFFIX, ONLY_DEFAULT_EXPORT } from './constant.js'
import isHasDefaultExport from './parse-default.js'
import { capitalize, replacePathIndex, replaceSuffix } from './shard.js'

export async function getAllFileListMap(
  path: string,
  outputAbsolutePath: string[],
  outputConfig: IOutputConfig
) {
  const map = new Map<string, Set<[string, string]>>()
  EXPORT_SUFFIX.forEach((key) => {
    map.set(key, new Set())
  })

  let globPath = `${path}/*.{${EXPORT_SUFFIX.join(',')}}`
  if (outputConfig.recursive) {
    globPath = `${path}/**/*.{${EXPORT_SUFFIX.join(',')}}`
  }

  let filePathList = await glob(globPath)
  filePathList = filePathList.filter(
    (path) => !outputAbsolutePath.includes(path)
  )
  filePathList.forEach((filePath) => {
    // 获取相对路径
    const suffixName = extname(filePath).split('.')[1]
    if (suffixName && map.has(suffixName)) {
      map.get(suffixName)!.add([relative(path, filePath), filePath])
    }
  })

  return map
}

export function parseModuleMap(
  map: Map<string, Set<[string, string]>>,
  isIgnoreIndexPath = false
) {
  let result: IExport[] = []
  for (const [suffix, fileSet] of map) {
    for (let [file, absolutePath] of fileSet.values()) {
      const componentName = capitalize(basename(file, `.${suffix}`))
      let newPath = file
      switch (suffix) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
          newPath = replaceSuffix(file)
          if (isIgnoreIndexPath) {
            newPath = replacePathIndex(newPath)
          }
          break
      }
      const exportInfo = {
        isDefaultExport:
          ONLY_DEFAULT_EXPORT.includes(suffix) ||
          isHasDefaultExport(absolutePath),
        exportName: componentName,
        exportPath: newPath,
        type: suffix,
      }
      result.unshift(exportInfo)
    }
  }
  return result
}
