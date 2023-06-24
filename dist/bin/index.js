import { writeFile, existsSync, readFileSync } from 'fs';
import { resolve, isAbsolute, join, extname, relative, basename } from 'path';
import glob from 'glob';
import { parse } from '@babel/parser';
import tranverse from '@babel/traverse';

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
function toUpperCase(str) {
    return str.replace(/^[a-z]/, (char) => char.toUpperCase());
}
function outputFile(path, ctx) {
    writeFile(path, ctx, (err) => {
        if (err)
            console.error(err);
        console.log(`write ${resolve(process.cwd(), path)} success`);
    });
}
function getOutputAbsolutePath(argv) {
    const { dirs } = argv;
    const output = dirs.map((dir) => dir.output).filter(Boolean);
    return output.map((path) => resolve(process.cwd(), path));
}

function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

function genAbsolutePath({ dirs }) {
    const getModulePath = (path) => {
        if (!isAbsolute(path)) {
            return resolve(process.cwd(), path);
        }
        return path;
    };
    const modulePath = dirs.map((dir) => getModulePath(dir.path));
    return modulePath;
}

const fileName = [
    'genIndexExport.config.js',
];
const suffix = ['js', 'jsx', 'ts', 'tsx', 'vue'];
const onlyDefaultExport = ['vue'];

function output(res) {
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
            str += `export { default as ${name} } from './${item.exportPath}'\n`;
            set.add(name);
        }
        if (!onlyDefaultExport.includes(item.type)) {
            str += `export * from './${item.exportPath}'\n`;
        }
        return set;
    }, new Set());
    return str;
}

function loadConfigFile(path) {
    // load config file
    path = path || process.cwd();
    let filePath = undefined;
    for (let i = 0; i < fileName.length; i++) {
        const configFilePath = join(path, fileName[i]);
        if (existsSync(configFilePath)) {
            filePath = configFilePath;
            break;
        }
    }
    if (filePath) {
        return import(filePath);
    }
    return null;
}
function argvTranslateConfig() {
    const argv = process.argv;
    const config = Object.create(null);
    let prevKey = '';
    for (let i = 0; i < argv.length; i++) {
        if (argv[i].startsWith('--')) {
            prevKey = argv[i].slice(2).split('=')[0];
            const value = argv[i].includes('=')
                ? argv[i].slice(argv[i].indexOf('=') + 1)
                : true;
            Reflect.set(config, prevKey, value);
        }
        else {
            if (prevKey) {
                const value = argv[i];
                const prevValue = Reflect.get(config, prevKey);
                if (typeof prevValue === 'boolean') {
                    Reflect.set(config, prevKey, value);
                }
                else if (typeof prevValue === 'string') {
                    Reflect.set(config, prevKey, [prevValue, value]);
                }
                else if (Array.isArray(prevValue)) {
                    Reflect.set(config, prevKey, [...prevValue, value]);
                }
            }
        }
    }
    const paths = Reflect.get(config, 'path');
    if (typeof paths !== 'undefined' && typeof paths !== 'boolean') {
        const outputs = Reflect.get(config, 'output') || [];
        let dirs = [];
        if (Array.isArray(paths)) {
            dirs = paths.map((path, i) => ({
                path,
                output: getOutputArgs(outputs, i),
            }));
        }
        else {
            const path = paths;
            dirs.push({ path, output: getOutputArgs(outputs, 0) });
        }
        Reflect.set(config, 'dirs', dirs);
    }
    return config;
}
function getOutputArgs(output, index) {
    if (Array.isArray(output)) {
        return output[index];
    }
    if (typeof output === 'boolean') {
        return undefined;
    }
    return output;
}
async function loadArvgConfig() {
    let argvConfig = {};
    const fileConfig = (await loadConfigFile()) || {};
    const argv = argvTranslateConfig();
    const config = (fileConfig.default || {});
    argvConfig = { ...config, ...argv };
    return argvConfig;
}

var isHasDefaultExport = (path) => {
    const code = readFileSync(path, 'utf-8');
    const ast = parse(code, {
        sourceType: 'unambiguous',
        plugins: ['typescript', 'jsx'],
    });
    let isHasDefeaultExport = false;
    // @ts-ignore
    tranverse.default(ast, {
        ExportDefaultDeclaration() {
            isHasDefeaultExport = true;
        },
    });
    return isHasDefeaultExport;
};

async function getAllFileListMap(path, outputAbsolutePath, outputConfig) {
    const map = new Map();
    suffix.forEach((key) => {
        map.set(key, new Set());
    });
    let globPath = `${path}/*.{${suffix.join(',')}}`;
    if (outputConfig.recursive) {
        globPath = `${path}/**/*.{${suffix.join(',')}}`;
    }
    let filePathList = await glob(globPath);
    filePathList = filePathList.filter((path) => !outputAbsolutePath.includes(path));
    filePathList.forEach((filePath) => {
        // 获取相对路径
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
            const componentName = toUpperCase(basename(file, `.${suffix}`));
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
                isDefaultExport: onlyDefaultExport.includes(suffix) ||
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

async function genExportIndex() {
    const argvConfig = await loadArvgConfig();
    const absolutePath = genAbsolutePath(argvConfig);
    const isIgnoreIndexPath = hasOwnProperty(argvConfig, 'ignoreIndexPath');
    const getOutput = async (path, argv, outputConfig) => {
        const outputAbsolutePath = getOutputAbsolutePath(argv);
        const exportMap = await getAllFileListMap(path, outputAbsolutePath, outputConfig);
        return output(parseModuleMap(exportMap, isIgnoreIndexPath));
    };
    const fileMap = new Map();
    const stdinSet = new Set();
    await Promise.all(absolutePath.map(async (path, index) => {
        const recursive = argvConfig.recursive || false;
        const ctx = await getOutput(path, argvConfig, { recursive });
        const output = argvConfig.dirs[index]?.output || Symbol.for('stdin'); // default output stdin
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
        outputFile(path, ctx);
    }
    if (stdinSet.size > 0)
        for (const ctx of stdinSet) {
            console.log(ctx);
        }
}
bootstrap();
