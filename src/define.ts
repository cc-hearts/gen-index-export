import { IConfig } from '../types/helper'

export function defineConfig<T extends IConfig>(config: T): T {
  return config
}
