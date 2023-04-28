import glob from 'glob'
import { isAbsolute, resolve, relative, extname, basename, join } from 'path'
import {
  replaceSuffix,
  argvTranslateConfig,
  replacePathIndex,
  toUpperCase,
  loadConfigFile,
  outputFile,
} from './src/shard.js'
import { hasOwnProperty } from '@cc-heart/utils'
import type { IConfig, IExport } from './types/helper'
import { output } from './src/output.js'

const ignoreDefaultExport = ['vue']

function genAbsolutePath({ path: modulePath }: IConfig) {
  const getModulePath = (path: string) => {
    if (!isAbsolute(path)) {
      return resolve(process.cwd(), path)
    }
    return path
  }
  if (Array.isArray(modulePath)) {
    modulePath = modulePath.map(path => getModulePath(path))
  } else {
    modulePath = getModulePath(modulePath)
  }
  return modulePath
}

async function getAllFileList(path: string) {
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

function parseModuleMap(
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
        type: suffix
      }
      result.unshift(exportInfo)
      if (!ignoreDefaultExport.includes(suffix)) {
        result.unshift({ ...exportInfo, isDefaultExport: false })
      }
    }
  }
  return result
}
// TODO: 命令行只能有一个 后续优化
async function bootstrap() {
  let argvConfig = argvTranslateConfig<IConfig>()
  const fileConfig = await loadConfigFile(argvConfig.config)
  if (fileConfig) {
    const config = fileConfig.default || {}
    argvConfig = { ...config, ...argvConfig }
  }
  if (!hasOwnProperty(argvConfig, 'path')) {
    throw new Error('path is required')
  }
  const absolutePath = genAbsolutePath(argvConfig)
  const isIgnoreIndexPath = hasOwnProperty(argvConfig, 'ignoreIndexPath')
  const getOutput = async (path: string) => {
    const exportMap = await getAllFileList(path)
    return output(parseModuleMap(exportMap, isIgnoreIndexPath))
  }
  if (Array.isArray(absolutePath)) {
    absolutePath.forEach(async (path) => {
      const ctx = await getOutput(path)
      const outputFilePath = join(path, argvConfig.output || 'index.ts')
      outputFile(outputFilePath, ctx)
    })
  } else {
    const exportStr = await getOutput(absolutePath)
    console.log(exportStr);
  }
}

bootstrap()
