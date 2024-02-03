import type { IConfig, IExport } from '../types/helper.js';
export declare function getAllFileListMap(dir: IConfig['dirs'][number]): Promise<Map<string, Set<[string, string]>>>;
export declare function parseModuleMap(map: Map<string, Set<[string, string]>>, isIgnoreIndexPath?: boolean): IExport[];
