import glob from 'glob'
import { relative, extname, basename } from 'path'
import { onlyDefaultExport, suffix } from './config.js'
import isHasDefaultExport from './parse-default.js'
import { replaceSuffix, replacePathIndex, toUpperCase } from './shard.js'
import type { IExport } from '../types/helper.js'
export async function getAllFileListMap(
  path: string,
  outputAbsolutePath: string[]
) {
  const map = new Map<string, Set<[string, string]>>()
  suffix.forEach((key) => {
    map.set(key, new Set())
  })
  let filePathList = await glob(`${path}/**/*.{${suffix.join(',')}}`)
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
      const componentName = toUpperCase(basename(file, `.${suffix}`))
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
        isDefaultExport: onlyDefaultExport.includes(suffix) || isHasDefaultExport(absolutePath),
        exportName: componentName,
        exportPath: newPath,
        type: suffix,
      }
      result.unshift(exportInfo)
    }
  }
  return result
}
