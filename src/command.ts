import { loadConfig } from '@cc-heart/unplugin-load-file'
import { getPackage } from '@cc-heart/utils-service'
import { Command } from 'commander'

import type { IConfig, ILoadConfig } from '../types/helper.js'
import { EXPORT_SUFFIX } from './constant.js'
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

function parseBooleanValues(value?: string) {
  return value === 'true' ? true : false
}

export function initHelp() {
  const { version } = getPackage()
  program
    .name('gen-index-export')
    .version(version, '-v, --version')
    .usage('[options]')
    .option('-o, --output [type...]', 'Specify the output file path')
    .option('-p, --path [type...]', 'Specify the file path to watch')
    .option('-r --recursive [type...]', 'Watch files recursively')
    .option('-s --suffix type[...]', 'Supported file extensions for export')
    .option('-e --excludes type[...]', 'List of files to exclude')

  program.parse()
}

type ObjectMapArrayObject<T extends Record<string, unknown>> = {
  [k in keyof T]: Array<T[k]>
}
type OptsParams = Omit<IConfig['dirs'][number], 'parser'>

function translateArgvByCommander() {
  const opts: ObjectMapArrayObject<OptsParams> = program.opts()

  const {
    path = [],
    output = [],
    recursive = [],
    suffix = [],
    excludes = [],
  } = opts
  if (path.length === 0) return {}

  const dirs: IConfig['dirs'] = path.map((path, i) => {
    return {
      path,
      output: output?.[i] || '',
      recursive: recursive?.[i]
        ? parseBooleanValues(recursive[i] as string)
        : false,
      suffix: suffix[i] || EXPORT_SUFFIX,
      excludes: excludes[i],
    }
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
