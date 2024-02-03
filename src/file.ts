import glob from 'glob'
import { basename, extname, relative } from 'path'
import type { IConfig, IExport } from '../types/helper.js'
import { EXPORT_SUFFIX, ONLY_DEFAULT_EXPORT } from './constant.js'
import isHasDefaultExport from './parse-default.js'
import { capitalize, replacePathIndex, replaceSuffix } from './shard.js'

export async function getAllFileListMap(
  dir: IConfig['dirs'][number]
) {
  const { path, recursive, output } = dir
  const map = new Map<string, Set<[string, string]>>()

  EXPORT_SUFFIX.forEach((key) => {
    map.set(key, new Set())
  })
  let globPath = `${path}/*.{${EXPORT_SUFFIX.join(',')}}`
  if (recursive) {
    globPath = `${path}/**/*.{${EXPORT_SUFFIX.join(',')}}`
  }


  let filePathList = (await glob(globPath))
  if (output) {
    const outputPath = output.replace(/^\.\//, '')
    filePathList = filePathList.filter(path => path !== outputPath)
  }

  filePathList.forEach((filePath) => {
    // get relative path
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
