import { parse } from '@babel/parser'
import tranverse from '@babel/traverse'
import { readFileSync } from 'fs'

export default (path: string) => {
  const code = readFileSync(path, 'utf-8')
  const ast = parse(code, {
    sourceType: 'unambiguous',
  })
  let isHasDefeaultExport = false
  // @ts-ignore
  tranverse.default(ast, {
    ExportDefaultDeclaration() {
      isHasDefeaultExport = true
    },
  })
  return isHasDefeaultExport
}
