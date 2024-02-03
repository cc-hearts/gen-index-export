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
    .option('-r --recursive [type...]', 'watch file is recursive')

  program.parse()
}
type ObjectMapArrayObject<T extends Record<string, unknown>> = {
  [k in keyof T]: Array<T[k]>
}
function translateArgvByCommander() {
  const opts: ObjectMapArrayObject<IConfig['dirs'][number]> = program.opts()

  const { path, output, recursive } = opts
  const dirs: IConfig['dirs'] = path.map((path, i) => {
    return { path, output: output?.[i] || '', recursive: recursive?.[i] || false }
  })
  return { dirs }
}
export default async function loadArgvConfig() {
  let argvConfig = {} as IConfig
  const fileConfig = (await loadConfigFile()) || {}
  const argv = translateArgvByCommander()
  const config = (fileConfig || {}) as IConfig
  argvConfig = { ...config, ...argv }
  return argvConfig
}
