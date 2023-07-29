import type { IConfig } from '../types/helper.js'

/**
 * @declare argvTranslateConfig function declares, use commander replace
 */
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
      dirs = paths.map((path, i) => ({
        path,
        output: getOutputArgs(outputs, i),
      }))
    } else {
      const path = paths as string
      dirs.push({ path, output: getOutputArgs(outputs, 0) })
    }
    Reflect.set(config, 'dirs', dirs)
  }

  return config
}
/**
 * @declare getOutputArgs function declares
 */
function getOutputArgs(output: string | boolean | string[], index: number) {
  if (Array.isArray(output)) {
    return output[index]
  }
  if (typeof output === 'boolean') {
    return undefined
  }
  return output
}
