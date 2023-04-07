export interface IConfig {
  path: string
  ignoreIndexPath?: boolean
}

export interface IExport {
  isDefaultExport?: boolean // 是否默认导出
  exportName?: string // 导出的名称
  exportPath?: string // 导出的路径
  type: 'js' | 'jsx' | 'ts' | 'tsx' | 'vue' | string
}