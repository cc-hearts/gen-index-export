
import { join } from 'path'
import { fileName } from './config.js'
import { existsSync } from 'fs'
import type { IConfig, ILoadConfig } from '../types/helper'


export function loadConfigFile(path?: string): Promise<ILoadConfig> | null {
  // load config file
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
  if (typeof paths !== 'undefined' && typeof paths !== 'boolean') {
    const outputs = (Reflect.get(config, 'output') as string | string[]) || []
    let dirs: IConfig['dirs'] = []
    if (Array.isArray(paths)) {
      dirs = paths.map((path, i) => ({ path, output: getOutputArgs(outputs, i) }))
    } else {
      const path = paths as string
      dirs.push({ path, output: getOutputArgs(outputs, 0) })
    }
    Reflect.set(config, 'dirs', dirs)
  }
  return config
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

export default async function loadArvgConfig() {
  let argvConfig = {} as IConfig
  const fileConfig = await loadConfigFile() || {}
  const argv = argvTranslateConfig()
  const config = (fileConfig.default || {}) as IConfig
  argvConfig = { ...config, ...argv }
  return argvConfig
}
