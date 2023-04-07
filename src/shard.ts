export function replaceSuffix(path: string, replaceSuffix = '') {
  return path.replace(/\..*?$/, replaceSuffix)
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
  return str.replace(/^[a-z]/, c => c.toUpperCase())
}