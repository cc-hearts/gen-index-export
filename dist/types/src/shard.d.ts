import type { IConfig, ILoadConfig } from '../types/helper';
export declare function replaceSuffix(path: string, replaceSuffix?: string): string;
export declare function loadConfigFile(path?: string): Promise<ILoadConfig> | null;
export declare function argvTranslateConfig<T extends object>(): T;
export declare function replacePathIndex(path: string): string;
export declare function toUpperCase(str: string): string;
export declare function outputFile(path: string, ctx: string): void;
export declare function getOutputAbsolutePath(argv: IConfig): string[];
