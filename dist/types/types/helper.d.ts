export interface IConfig {
    dirs: Array<{
        path: string;
        output?: string;
        recursive?: string | boolean;
        dirIndex?: string | boolean;
        suffix?: string[];
    }>;
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
