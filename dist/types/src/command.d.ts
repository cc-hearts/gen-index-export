import type { IConfig, ILoadConfig } from '../types/helper.js';
/**
 * load config file
 * @param path
 * @returns
 */
export declare function loadConfigFile(path?: string): Promise<ILoadConfig> | null;
export declare function initHelp(): void;
export default function loadArgvConfig(): Promise<IConfig>;
