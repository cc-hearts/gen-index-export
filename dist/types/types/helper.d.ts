export interface IConfig {
    dirs: Array<{
        path: string;
        output?: string;
        recursive?: boolean;
    }>;
    ignoreIndexPath?: boolean;
    recursive?: boolean;
    config?: string;
    output?: string[];
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
export interface IOutputConfig {
    recursive?: boolean;
}
