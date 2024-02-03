/**
 * Replaces the suffix of a given path with a specified suffix.
 * @param {string} path - The path to modify.
 * @param {string} replaceSuffix - The suffix to replace the original suffix with. Defaults to an empty string.
 * @return {string} Returns the modified path.
 */
export declare function replaceSuffix(path: string, replaceSuffix?: string): string;
export declare function replacePathIndex(path: string): string;
export declare function capitalize(str: string): string;
export declare function writeOutputFile(path: string, ctx: string): void;
export declare function getOutputAbsolutePath(relativePath: string): string;
