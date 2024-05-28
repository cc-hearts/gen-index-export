export interface IConfig {
  dirs: Array<{
    path: string
    output?: string
    recursive?: string | boolean
    suffix?: string[]
    parser?: (path: string) => string | void // 预解析的路径列表，需要 suffix 存在解析的路径
    excludes?: (string | RegExp)[]
  }>
}

export interface IExport {
  isDefaultExport?: boolean // 是否默认导出
  exportName?: string // 导出的名称
  exportPath?: string // 导出的路径
  absolutePath: string
  parser?: IConfig['dirs'][number]['parser']
  type: 'js' | 'jsx' | 'ts' | 'tsx' | 'vue' | string
}

export interface ILoadConfig {
  default?: IConfig
}
