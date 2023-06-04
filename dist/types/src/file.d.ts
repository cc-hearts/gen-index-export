import type { IExport } from '../types/helper.js';
export declare function getAllFileListMap(path: string, outputAbsolutePath: string[]): Promise<Map<string, Set<string>>>;
export declare function parseModuleMap(map: Map<string, Set<string>>, isIgnoreIndexPath?: boolean): IExport[];
