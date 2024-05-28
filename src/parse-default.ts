import { parse } from '@babel/parser'
import _traverse from '@babel/traverse'
import { readFileSync } from 'fs'
// @ts-ignore
const traverse = _traverse.default || _traverse
export default (path: string) => {
  const code = readFileSync(path, 'utf-8')
  const ast = parse(code, {
    sourceType: 'unambiguous',
    plugins: ['typescript', 'jsx'],
  })
  let isHasDefaultExport = false
  // @ts-ignore
  traverse(ast, {
    ExportDefaultDeclaration() {
      isHasDefaultExport = true
    },
  })
  return isHasDefaultExport
}
