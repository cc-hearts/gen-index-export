import glob from 'glob'
import { basename, extname, relative, resolve } from 'path'
import type { IConfig, IExport } from '../types/helper.js'
import { EXPORT_SUFFIX, ONLY_DEFAULT_EXPORT } from './constant.js'
import isHasDefaultExport from './parse-default.js'
import { capitalize, replaceSuffix } from './shard.js'

export async function getAllFileListMap(dir: IConfig['dirs'][number]) {
  const { path, recursive, output, dirIndex } = dir
  const map = new Map<string, Set<[string, string]>>()
  const exportSuffix = dir.suffix || EXPORT_SUFFIX

  exportSuffix.forEach((key) => {
    map.set(key, new Set())
  })

  const suffixStr = exportSuffix.join(',')
  let globPath = `${path}/*.{${suffixStr}}`
  if (recursive) {
    globPath = `${path}/**/*.{${suffixStr}}`
  }

  if (exportSuffix.length === 1) {
    globPath = globPath.replace(/{(.*)}$/, '$1')
  }

  let filePathList = await glob(globPath, {
    ignore: {
      ignored: (p) => {
        if (!dir.excludes) return false
        let bool = false
        for (const target of dir.excludes) {
          if (typeof target === 'string') bool = p.name.includes(target)
          else if (target instanceof RegExp) {
            target.lastIndex = 0
            bool = target.test(p.name)
          }

          if (bool) return bool
        }
        return bool
      },
    },
  })

  if (dirIndex) {
    const fileDirIndexPath = `${path}/*/index.{${suffixStr}}`
    const indexFilePathList = await glob(fileDirIndexPath)
    filePathList = filePathList.concat(indexFilePathList)
  }

  if (output) {
    const outputPath = output.replace(/^\.\//, '')
    filePathList = filePathList.filter((path) => path !== outputPath)
  }

  filePathList.forEach((filePath) => {
    // get relative path
    const suffixName = extname(filePath).split('.')[1]
    if (suffixName && map.has(suffixName) && output) {
      map.get(suffixName)!.add([readRelativePath(output, filePath), filePath])
    }
  })
  return map
}

function readRelativePath(originPath: string, targetPath: string) {
  const originAbsolutePath = resolve(originPath, '..')
  const targetAbsolutePath = resolve(targetPath)
  return relative(originAbsolutePath, targetAbsolutePath)
}

export function parseModuleMap(
  map: Map<string, Set<[string, string]>>,
  parser?: (path: string) => string | void,
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
          break
      }
      const parseExportDefaultFileSuffix = EXPORT_SUFFIX.filter(_ => !['vue'].includes(_))

      const exportInfo = {
        isDefaultExport:
          ONLY_DEFAULT_EXPORT.includes(suffix) ||
          parseExportDefaultFileSuffix.includes(suffix) && isHasDefaultExport(absolutePath),
        exportName: componentName,
        exportPath: newPath,
        absolutePath,
        parser,
        type: suffix,
      }
      result.unshift(exportInfo)
    }
  }
  return result
}
