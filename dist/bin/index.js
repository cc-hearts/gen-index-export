import { writeFile, existsSync } from 'fs';
import { resolve, join, isAbsolute, extname, relative, basename } from 'path';
import glob from 'glob';

function replaceSuffix(path, replaceSuffix = '') {
    return path.replace(/\..*?$/, replaceSuffix);
}
function loadConfigFile(path) {
    // 加载配置文件
    const fileName = [
        'genIndexExport.config.ts',
        'genIndexExport.config.cjs',
        'genIndexExport.config.js',
    ];
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
function getOutputArgs(output, index) {
    if (Array.isArray(output)) {
        return output[index];
    }
    if (typeof output === 'boolean') {
        return undefined;
    }
    return output;
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
    if (typeof paths === 'undefined' || paths === true) {
        throw new Error('arvg path is required');
    }
    const outputs = Reflect.get(config, 'output') || [];
    let dirs = [];
    if (Array.isArray(paths)) {
        dirs = paths.map((path, i) => ({ path, output: getOutputArgs(outputs, i) }));
    }
    else {
        const path = paths;
        dirs.push({ path, output: getOutputArgs(outputs, 0) });
    }
    Reflect.set(config, 'dirs', dirs);
    return config;
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
        else {
            str += `export * from './${item.exportPath}'\n`;
        }
        return set;
    }, new Set());
    return str;
}

const ignoreDefaultExport = ['vue'];
async function getAllFileListMap(path) {
    const suffix = ['js', 'jsx', 'ts', 'tsx', 'vue'];
    const map = new Map();
    suffix.forEach((key) => {
        map.set(key, new Set());
    });
    const fileList = await glob(`${path}/**/*.{${suffix.join(',')}}`);
    fileList.forEach((file) => {
        // 获取相对路径
        const suffixName = extname(file).split('.')[1];
        if (suffixName && map.has(suffixName)) {
            map.get(suffixName).add(relative(path, file));
        }
    });
    return map;
}
function parseModuleMap(map, isIgnoreIndexPath = false) {
    let result = [];
    for (const [suffix, fileSet] of map) {
        for (let file of fileSet.values()) {
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
                isDefaultExport: true,
                exportName: componentName,
                exportPath: newPath,
                type: suffix,
            };
            result.unshift(exportInfo);
            if (!ignoreDefaultExport.includes(suffix)) {
                result.unshift({ ...exportInfo, isDefaultExport: false });
            }
        }
    }
    return result;
}

async function genExportIndex(argvConfig) {
    const fileConfig = await loadConfigFile(argvConfig.config);
    if (fileConfig) {
        const config = fileConfig.default || {};
        argvConfig = { ...config, ...argvConfig };
    }
    if (!hasOwnProperty(argvConfig, 'dirs')) {
        throw new Error('dirs is required');
    }
    const absolutePath = genAbsolutePath(argvConfig);
    const isIgnoreIndexPath = hasOwnProperty(argvConfig, 'ignoreIndexPath');
    const getOutput = async (path) => {
        const exportMap = await getAllFileListMap(path);
        return output(parseModuleMap(exportMap, isIgnoreIndexPath));
    };
    const fileMap = new Map();
    const stdinSet = new Set();
    await Promise.all(absolutePath.map(async (path, index) => {
        const ctx = await getOutput(path);
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

// TODO: 命令行只能有一个 后续优化
async function bootstrap() {
    let argvConfig = argvTranslateConfig();
    const [fileMap, stdinSet] = await genExportIndex(argvConfig);
    for (const [path, ctx] of fileMap) {
        outputFile(path, ctx);
    }
    if (stdinSet.size > 0)
        for (const ctx of stdinSet) {
            console.log(ctx);
        }
}
bootstrap();
