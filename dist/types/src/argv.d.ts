import type { IConfig, ILoadConfig } from '../types/helper.js';
export declare function loadConfigFile(path?: string): Promise<ILoadConfig> | null;
export declare function argvTranslateConfig<T extends object>(): T;
export default function loadArvgConfig(): Promise<IConfig>;
