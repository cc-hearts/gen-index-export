export interface IConfig {
    path: string;
    ignoreIndexPath?: boolean;
}
export interface IExport {
    isDefaultExport?: boolean;
    exportName?: string;
    exportPath?: string;
    type: 'js' | 'jsx' | 'ts' | 'tsx' | 'vue' | string;
}
