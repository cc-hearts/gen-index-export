import type { IConfig, ILoadConfig } from '../types/helper.js';
/**
 * load config file
 * @param path
 * @returns
 */
export declare function loadConfigFile(): Promise<ILoadConfig | null>;
export declare function initHelp(): void;
export default function loadArgvConfig(): Promise<IConfig>;
