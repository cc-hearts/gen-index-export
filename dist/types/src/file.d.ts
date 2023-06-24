import type { IExport, IOutputConfig } from '../types/helper.js';
export declare function getAllFileListMap(path: string, outputAbsolutePath: string[], outputConfig: IOutputConfig): Promise<Map<string, Set<[string, string]>>>;
export declare function parseModuleMap(map: Map<string, Set<[string, string]>>, isIgnoreIndexPath?: boolean): IExport[];
