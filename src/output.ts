import type { IExport } from '../types/helper'
import { onlyDefaultExport } from './config.js'
export function output(res: IExport[]): string {
  let str = ''
  if (!res) return str
  res.reduce<Set<string>>((set, item) => {
    if (item.isDefaultExport) {
      let name = item.exportName
      if (!name) return set
      while (set.has(name)) {
        name = `${name}_${Math.round(Math.random() * Math.pow(10, 5))}`
      }
      str += `export { default as ${name} } from './${item.exportPath}'\n`
      set.add(name)
    }
    if (!onlyDefaultExport.includes(item.type)) {
      str += `export * from './${item.exportPath}'\n`
    }
    return set
  }, new Set())
  return str
}
