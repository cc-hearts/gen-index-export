import glob from 'glob'
import { relative, extname, basename } from 'path'
import { replaceSuffix, replacePathIndex, toUpperCase } from './shard.js'
import type { IExport } from '../types/helper.js'
const ignoreDefaultExport = ['vue']
export async function getAllFileListMap(path: string) {
  const suffix = ['js', 'jsx', 'ts', 'tsx', 'vue']
  const map = new Map<string, Set<string>>()
  suffix.forEach((key) => {
    map.set(key, new Set())
  })
  const fileList = await glob(`${path}/**/*.{${suffix.join(',')}}`)
  fileList.forEach((file) => {
    // 获取相对路径
    const suffixName = extname(file).split('.')[1]

    if (suffixName && map.has(suffixName)) {
      map.get(suffixName)!.add(relative(path, file))
    }
  })

  return map
}

export function parseModuleMap(
  map: Map<string, Set<string>>,
  isIgnoreIndexPath = false
) {
  let result: IExport[] = []
  for (const [suffix, fileSet] of map) {
    for (let file of fileSet.values()) {
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
        isDefaultExport: true,
        exportName: componentName,
        exportPath: newPath,
        type: suffix,
      }
      result.unshift(exportInfo)
      if (!ignoreDefaultExport.includes(suffix)) {
        result.unshift({ ...exportInfo, isDefaultExport: false })
      }
    }
  }
  return result
}
