export interface IConfig {
  dirs: Array<{
    path: string
    output?: string
    recursive?: boolean // 是否递归
  }>
  ignoreIndexPath?: boolean
  recursive?: boolean
  config?: string // 配置文件
  output?: string[]
}

export interface IExport {
  isDefaultExport?: boolean // 是否默认导出
  exportName?: string // 导出的名称
  exportPath?: string // 导出的路径
  type: 'js' | 'jsx' | 'ts' | 'tsx' | 'vue' | string
}

export interface ILoadConfig {
  default?: IConfig
}

export interface IOutputConfig {
  recursive?: boolean // 是否递归
}
