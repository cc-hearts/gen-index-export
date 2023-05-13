export interface IConfig {
    dirs: Array<{
        path: string;
        output?: string;
    }>;
    ignoreIndexPath?: boolean;
    config?: string;
}
export interface IExport {
    isDefaultExport?: boolean;
    exportName?: string;
    exportPath?: string;
    type: 'js' | 'jsx' | 'ts' | 'tsx' | 'vue' | string;
}
export interface ILoadConfig {
    default?: IConfig;
}
