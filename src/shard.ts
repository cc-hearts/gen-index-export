import { writeFile } from 'fs'
import { resolve } from 'path'
import type { IConfig } from '../types/helper'

/**
 * Replaces the suffix of a given path with a specified suffix.
 * @param {string} path - The path to modify.
 * @param {string} replaceSuffix - The suffix to replace the original suffix with. Defaults to an empty string.
 * @return {string} Returns the modified path.
 */
export function replaceSuffix(path: string, replaceSuffix = '') {
  return path.replace(/\..*?$/, replaceSuffix)
}

export function replacePathIndex(path: string) {
  return path.replace(/\/index$/, '')
}

export function capitalize(str: string) {
  return str.replace(/^[a-z]/, (char) => char.toUpperCase())
}

export function writeOutputFile(path: string, ctx: string) {
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
