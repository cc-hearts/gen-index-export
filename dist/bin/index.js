#!/usr/bin/env node
import { writeFile, readFileSync } from 'fs';
import { resolve, extname, relative, basename } from 'path';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { rm, writeFile as writeFile$1, readFile as readFile$1 } from 'fs/promises';
import { rollup } from 'rollup';
import { existsSync } from 'node:fs';
import 'url';
import { readFile } from 'node:fs/promises';
import { Command } from 'commander';
import glob from 'glob';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';

/**
 * Replaces the suffix of a given path with a specified suffix.
 * @param {string} path - The path to modify.
 * @param {string} replaceSuffix - The suffix to replace the original suffix with. Defaults to an empty string.
 * @return {string} Returns the modified path.
 */
function replaceSuffix(path, replaceSuffix = '') {
    return path.replace(/\..*?$/, replaceSuffix);
}
function replacePathIndex(path) {
    return path.replace(/\/index$/, '');
}
function capitalize$1(str) {
    return str.replace(/^[a-z]/, (char) => char.toUpperCase());
}
function writeOutputFile(path, ctx) {
    writeFile(path, ctx, (err) => {
        if (err)
            console.error(err);
        console.log(`write ${resolve(process.cwd(), path)} success`);
    });
}

function getFileExtension(path) {
    return path.split('.').slice(-1)[0];
}
function getResolvePath(loadFileList) {
    let resolvePath;
    for (const configPath of loadFileList) {
        if (existsSync(configPath)) {
            resolvePath = configPath;
            break;
        }
    }
    return resolvePath;
}

/**
 * Retrieves the contents of a package.json file.
 *
 * @param {string=} path - The path to the package.json file. If not provided, the current working directory will be used.
 * @return {Promise<T = any>} A promise that resolves to the parsed contents of the package.json file.
 */
async function getPackage$1(path) {
    path = path || resolve(process.cwd(), 'package.json');
    const packages = await readFile$1(path, { encoding: 'utf-8' });
    return JSON.parse(packages);
}

function isCommonJsExtension(path) {
    return ['cts', 'cjs'].includes(getFileExtension(path));
}
async function isESM(path) {
    if (path) {
        if (!existsSync(path)) {
            throw new Error('File not found');
        }
        if (isCommonJsExtension(path))
            return false;
        const file = await readFile(path, 'utf8');
        return !file.includes('module.exports');
    }
    return (await getPackage$1()).type === 'module';
}
function isTS(path) {
    return ['mts', 'cts', 'ts'].includes(getFileExtension(path));
}

async function loadRollupPlugins(path) {
    const plugins = [];
    if (!(await isESM(path))) {
        plugins.push(commonjs());
    }
    return plugins;
}
async function transformTsToJs(filePath, inputOptions, outputOptions) {
    if (isTS(filePath)) {
        if (Array.isArray(inputOptions.plugins)) {
            inputOptions.plugins = [...inputOptions.plugins, typescript()];
        }
        const bundle = await rollup(inputOptions);
        const { output } = await bundle.generate(outputOptions);
        const { code } = output[0];
        const tsToJsPath = resolve(process.cwd(), './__config.__tsTransformJs.mjs');
        await writeFile$1(tsToJsPath, code, 'utf8');
        return tsToJsPath;
    }
    return filePath;
}
async function build(inputOptions, outputOptions) {
    const bundle = await rollup(inputOptions);
    await bundle.write(outputOptions);
}
async function compileLoadConfig(loadFileList) {
    const resolvePath = getResolvePath(loadFileList);
    if (!resolvePath) {
        console.log('No found configuration file ');
        return null;
    }
    const plugins = await loadRollupPlugins(resolvePath);
    const rollupConfig = {
        input: resolvePath,
        plugins,
    };
    const outputFilePath = resolve(process.cwd(), './__config__.mjs');
    const rmPathList = [outputFilePath];
    const outputOptions = {
        file: outputFilePath,
        format: 'esm',
    };
    const bundlePath = await transformTsToJs(outputFilePath, rollupConfig, outputOptions);
    if (bundlePath !== outputFilePath) {
        rmPathList.push(bundlePath);
        rollupConfig.input = bundlePath;
    }
    await build(rollupConfig, outputOptions);
    try {
        const { default: config } = await import(outputOptions.file);
        return config;
    }
    catch (e) {
    }
    finally {
        rmPathList.forEach((path) => rm(path));
    }
    return null;
}

const DEFAULT_SUFFIX = ['js', 'ts', 'mjs', 'cjs', 'mts', 'cts'];

function parseLoadFile(filePath, suffixList) {
    if (!filePath) {
        throw new Error('filePath is not empty');
    }
    if (!Array.isArray(suffixList)) {
        throw new Error('suffix must be array');
    }
    return suffixList.map((suffix) => `${filePath}.${suffix}`);
}

async function loadConfig(config) {
    const { filename, suffixList = DEFAULT_SUFFIX, dirPath = process.cwd(), } = config;
    if (!filename) {
        throw new Error('filename is not empty');
    }
    const filePath = resolve(dirPath, filename);
    const loadFileList = parseLoadFile(filePath, suffixList);
    return await compileLoadConfig(loadFileList);
}

function getPackage(path) {
    path = path || resolve(process.cwd(), 'package.json');
    const packages = readFileSync(path, { encoding: 'utf-8' });
    return JSON.parse(packages);
}

const program = new Command();
/**
 * load config file
 * @param path
 * @returns
 */
async function loadConfigFile() {
    try {
        const config = await loadConfig({
            filename: 'gen-export.config',
            suffixList: ['ts', 'mts', 'mjs', 'js'],
        });
        return config;
    }
    catch (e) {
        console.error('[loadConfigFile] load config file error', e);
    }
    return null;
}
function initHelp() {
    const { version } = getPackage();
    program
        .name('gen-index-export')
        .version(version, '-v, --version')
        .usage('[options]')
        .option('-o, --output [type...]', 'output file path')
        .option('-p, --path [type...]', 'watch file path')
        .option('--recursive', 'watch file is recursive')
        .option('--ignoreIndexPath', 'ignore watch index file');
    program.parse();
}
function translateArgvByCommander() {
    const opts = program.opts();
    let paths;
    if (opts.path instanceof Array) {
        if (opts.path.length === 1) {
            [paths] = opts.path;
        }
        else {
            paths = [...opts.path];
        }
    }
    if (paths === undefined)
        return {};
    const outputs = opts.output || [];
    const dirs = paths.map((path, i) => {
        return { path, output: outputs[i] };
    });
    return { ...opts, dirs };
}
async function loadArgvConfig() {
    let argvConfig = {};
    const fileConfig = (await loadConfigFile()) || {};
    const argv = translateArgvByCommander();
    const config = (fileConfig || {});
    argvConfig = { ...config, ...argv };
    return argvConfig;
}

const EXPORT_SUFFIX = ['js', 'jsx', 'ts', 'tsx', 'vue'];
const ONLY_DEFAULT_EXPORT = ['vue'];

// @ts-ignore
const traverse = _traverse.default || _traverse;
var isHasDefaultExport = (path) => {
    const code = readFileSync(path, 'utf-8');
    const ast = parse(code, {
        sourceType: 'unambiguous',
        plugins: ['typescript', 'jsx'],
    });
    let isHasDefaultExport = false;
    // @ts-ignore
    traverse(ast, {
        ExportDefaultDeclaration() {
            isHasDefaultExport = true;
        },
    });
    return isHasDefaultExport;
};

async function getAllFileListMap(dir) {
    const { path, recursive, output } = dir;
    const map = new Map();
    EXPORT_SUFFIX.forEach((key) => {
        map.set(key, new Set());
    });
    let globPath = `${path}/*.{${EXPORT_SUFFIX.join(',')}}`;
    if (recursive) {
        globPath = `${path}/**/*.{${EXPORT_SUFFIX.join(',')}}`;
    }
    const outputPath = output.replace(/^\.\//, '');
    const filePathList = (await glob(globPath)).filter(path => path !== outputPath);
    filePathList.forEach((filePath) => {
        // get relative path
        const suffixName = extname(filePath).split('.')[1];
        if (suffixName && map.has(suffixName)) {
            map.get(suffixName).add([relative(path, filePath), filePath]);
        }
    });
    return map;
}
function parseModuleMap(map, isIgnoreIndexPath = false) {
    let result = [];
    for (const [suffix, fileSet] of map) {
        for (let [file, absolutePath] of fileSet.values()) {
            const componentName = capitalize$1(basename(file, `.${suffix}`));
            let newPath = file;
            switch (suffix) {
                case 'js':
                case 'jsx':
                case 'ts':
                case 'tsx':
                    newPath = replaceSuffix(file);
                    if (isIgnoreIndexPath) {
                        newPath = replacePathIndex(newPath);
                    }
                    break;
            }
            const exportInfo = {
                isDefaultExport: ONLY_DEFAULT_EXPORT.includes(suffix) ||
                    isHasDefaultExport(absolutePath),
                exportName: componentName,
                exportPath: newPath,
                type: suffix,
            };
            result.unshift(exportInfo);
        }
    }
    return result;
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param target - The string to be capitalized.
 * @return - The capitalized string.
 */
const capitalize = (target) => (target.charAt(0).toUpperCase() + target.slice(1));

function formatOutput(res) {
    let str = '';
    if (!res)
        return str;
    res.reduce((set, item) => {
        if (item.isDefaultExport) {
            let name = item.exportName;
            if (!name)
                return set;
            while (set.has(name)) {
                name = `${name}_${Math.round(Math.random() * Math.pow(10, 5))}`;
            }
            // progress-bar -> progressBar
            if (name.includes('-')) {
                name = name
                    .split('-')
                    .map((target) => capitalize(target))
                    .join('');
            }
            name = capitalize(name);
            str += `export { default as ${name} } from './${item.exportPath}'\n`;
            set.add(name);
        }
        if (!ONLY_DEFAULT_EXPORT.includes(item.type)) {
            str += `export * from './${item.exportPath}'\n`;
        }
        return set;
    }, new Set());
    return str;
}

const getOutput = async (dir) => {
    const exportMap = await getAllFileListMap(dir);
    return formatOutput(parseModuleMap(exportMap));
};
async function genExportIndex() {
    initHelp();
    const argvConfig = await loadArgvConfig();
    // const isIgnoreIndexPath = hasOwn(argvConfig, 'ignoreIndexPath')
    const fileMap = new Map();
    const stdinSet = new Set();
    const { dirs = [] } = argvConfig;
    await Promise.all(dirs.map(async (dir, index) => {
        const ctx = await getOutput(dir);
        const output = argvConfig.dirs[index]?.output || Symbol.for('stdin');
        if (output === Symbol.for('stdin')) {
            stdinSet.add(ctx);
        }
        else {
            if (typeof output === 'string')
                fileMap.set(output, ctx);
        }
    }));
    return [fileMap, stdinSet];
}

async function bootstrap() {
    const [fileMap, stdinSet] = await genExportIndex();
    for (const [path, ctx] of fileMap) {
        writeOutputFile(path, ctx);
    }
    if (stdinSet.size > 0)
        for (const ctx of stdinSet) {
            console.log(ctx);
        }
}
bootstrap();
