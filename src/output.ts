import { isFn, capitalize } from '@cc-heart/utils'
import type { IExport } from '../types/helper'
import { ONLY_DEFAULT_EXPORT } from './constant.js'

export function formatOutput(res: Array<IExport>): string {
  let str = ''
  if (!res) return str
  res.reduce<Set<string>>((set, item) => {
    const exportPath = item.exportPath?.startsWith('.')
      ? item.exportPath
      : `./${item.exportPath}`

    if (isFn(item.parser)) {
      const exportSyntax = item.parser(item.exportPath!)
      if (exportSyntax) {
        str += exportSyntax
        return set
      }
    }

    if (item.isDefaultExport) {
      let name = item.exportName
      if (!name) return set
      while (set.has(name)) {
        name = `${name}_${Math.round(Math.random() * Math.pow(10, 5))}`
      }
      // progress-bar -> progressBar
      if (name.includes('-')) {
        name = name
          .split('-')
          .map((target) => capitalize(target))
          .join('')
      }
      name = capitalize(name)
      str += `export { default as ${name} } from '${exportPath}'\n`
      set.add(name)
    }

    if (!ONLY_DEFAULT_EXPORT.includes(item.type)) {
      str += `export * from '${exportPath}'\n`
    }

    return set
  }, new Set())
  return str
}
