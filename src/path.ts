import { isAbsolute, resolve, relative } from 'path'
import type { IConfig } from '../types/helper'

export function genModulesAbsolutePath({ dirs }: IConfig) {
  const getModulePath = (path: string) => {
    if (!isAbsolute(path)) {
      return resolve(process.cwd(), path)
    }
    return path
  }

  const modulesPath = dirs.map((dir) => getModulePath(dir.path))
  return modulesPath
}

export function parseRelativePath(path: string) {
  return relative(process.cwd(), path)
}
