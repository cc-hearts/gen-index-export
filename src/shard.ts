import { existsSync, writeFile } from 'fs'
import { join, resolve } from 'path'
import type { IConfig, ILoadConfig } from '../types/helper'

export function replaceSuffix(path: string, replaceSuffix = '') {
  return path.replace(/\..*?$/, replaceSuffix)
}

export function loadConfigFile(path?: string): Promise<ILoadConfig> | null {
  // 加载配置文件
  const fileName = [
    'genIndexExport.config.ts',
    'genIndexExport.config.cjs',
    'genIndexExport.config.js',
  ]
  path = path || process.cwd()
  let filePath: string | void = undefined
  for (let i = 0; i < fileName.length; i++) {
    const configFilePath = join(path, fileName[i])
    if (existsSync(configFilePath)) {
      filePath = configFilePath
      break
    }
  }
  if (filePath) {
    return import(filePath)
  }
  return null
}

function getOutputArgs(output: string | boolean | string[], index: number) {
  if (Array.isArray(output)) {
    return output[index]
  }
  if (typeof output === 'boolean') {
    return undefined
  }
  return output
}

export function argvTranslateConfig<T extends object>(): T {
  const argv = process.argv
  const config: T = Object.create(null)
  let prevKey = ''
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      prevKey = argv[i].slice(2).split('=')[0]
      const value = argv[i].includes('=')
        ? argv[i].slice(argv[i].indexOf('=') + 1)
        : true
      Reflect.set(config, prevKey, value)
    } else {
      if (prevKey) {
        const value: string = argv[i]
        const prevValue = Reflect.get(config, prevKey)
        if (typeof prevValue === 'boolean') {
          Reflect.set(config, prevKey, value)
        } else if (typeof prevValue === 'string') {
          Reflect.set(config, prevKey, [prevValue, value])
        } else if (Array.isArray(prevValue)) {
          Reflect.set(config, prevKey, [...prevValue, value])
        }
      }
    }
  }
  const paths = Reflect.get(config, 'path')
  if (typeof paths === 'undefined' || paths === true) {
    throw new Error('arvg path is required')
  }
  const outputs = (Reflect.get(config, 'output') as string | string[]) || []
  let dirs: IConfig['dirs'] = []
  if (Array.isArray(paths)) {
    dirs = paths.map((path, i) => ({ path, output: getOutputArgs(outputs, i) }))
  } else {
    const path = paths as string
    dirs.push({ path, output: getOutputArgs(outputs, 0) })
  }
  Reflect.set(config, 'dirs', dirs)
  return config
}

export function replacePathIndex(path: string) {
  return path.replace(/\/index$/, '')
}

export function toUpperCase(str: string) {
  return str.replace(/^[a-z]/, (char) => char.toUpperCase())
}

export function outputFile(path: string, ctx: string) {
  writeFile(path, ctx, (err) => {
    if (err) console.error(err)
    console.log(`write ${resolve(process.cwd(), path)} success`)
  })
}

export function getOutputAbsolutePath(argv: IConfig) {
  const { dirs } = argv
  const output = dirs.map((dir) => dir.output!).filter(Boolean)
  return output.map((path) => resolve(process.cwd(), path))
}
