import { existsSync, writeFile } from "fs"
import { join } from "path"
import type { ILoadConfig } from "../types/helper"

export function replaceSuffix(path: string, replaceSuffix = '') {
  return path.replace(/\..*?$/, replaceSuffix)
}

export function loadConfigFile(path?: string): Promise<ILoadConfig> | null {
  // 加载配置文件
  const fileName = ['genIndexExport.config.ts', 'genIndexExport.config.cjs', 'genIndexExport.config.js']
  path = path || process.cwd()
  let filePath: string | void
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
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2).split('=')[0]
      const value = argv[i].includes('=')
        ? argv[i].slice(argv[i].indexOf('=') + 1)
        : argv[i + 1]
      Reflect.set(config, key, value)
    }
  }
  return config
}

export function replacePathIndex(path: string) {
  return path.replace(/\/index$/, '')
}

export function toUpperCase(str: string) {
  return str.replace(/^[a-z]/, char => char.toUpperCase())
}

export function outputFile(path: string, ctx: string) {
  writeFile(path, ctx, err => {
    console.error(err);
  })
}