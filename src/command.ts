import { loadConfig } from '@cc-heart/unplugin-load-file'
import { getPackage } from '@cc-heart/utils-service'
import { Command } from 'commander'

import type { IConfig, ILoadConfig } from '../types/helper.js'
const program = new Command()

/**
 * load config file
 * @param path
 * @returns
 */
export async function loadConfigFile(): Promise<ILoadConfig | null> {
  try {
    const config = await loadConfig<ILoadConfig>({
      filename: 'gen-export.config',
      suffixList: ['ts', 'mts', 'mjs', 'js'],
    })
    return config
  } catch (e) {
    console.error('[loadConfigFile] load config file error', e)
  }
  return null
}
export function initHelp() {
  const { version } = getPackage()
  program
    .name('gen-index-export')
    .version(version, '-v, --version')
    .usage('[options]')
    .option('-o, --output [type...]', 'output file path')
    .option('-p, --path [type...]', 'watch file path')
    .option('--recursive', 'watch file is recursive')
    .option('--ignoreIndexPath', 'ignore watch index file')

  program.parse()
}

function translateArgvByCommander() {
  const opts = program.opts()
  let paths: string[] | undefined
  if (opts.path instanceof Array) {
    if (opts.path.length === 1) {
      ;[paths] = opts.path
    } else {
      paths = [...opts.path]
    }
  }
  if (paths === undefined) return {} as IConfig['dirs']
  const outputs = opts.output || []
  const dirs: IConfig['dirs'] = paths.map((path, i) => {
    return { path, output: outputs[i] }
  })
  return { ...opts, dirs }
}
export default async function loadArgvConfig() {
  let argvConfig = {} as IConfig
  const fileConfig = (await loadConfigFile()) || {}
  const argv = translateArgvByCommander()
  const config = (fileConfig || {}) as IConfig
  argvConfig = { ...config, ...argv }
  return argvConfig
}
