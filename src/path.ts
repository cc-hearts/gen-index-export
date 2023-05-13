import { isAbsolute, resolve, relative } from 'path'
import type { IConfig } from '../types/helper'

export function genAbsolutePath({ dirs }: IConfig) {
  const getModulePath = (path: string) => {
    if (!isAbsolute(path)) {
      return resolve(process.cwd(), path)
    }
    return path
  }

  const modulePath = dirs.map((dir) => getModulePath(dir.path))
  return modulePath
}

export function parseRelativePath(path: string) {
  return relative(process.cwd(), path)
}
