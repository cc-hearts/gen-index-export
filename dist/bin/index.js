import glob from 'glob';
import { join, isAbsolute, resolve, extname, relative, basename } from 'path';
import { existsSync, writeFile } from 'fs';

function replaceSuffix(path, replaceSuffix = '') {
    return path.replace(/\..*?$/, replaceSuffix);
}
function loadConfigFile(path) {
    // 加载配置文件
    const fileName = ['genIndexExport.config.ts', 'genIndexExport.config.cjs', 'genIndexExport.config.js'];
    path = path || process.cwd();
    let filePath;
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
    for (let i = 0; i < argv.length; i++) {
        if (argv[i].startsWith('--')) {
            const key = argv[i].slice(2).split('=')[0];
            const value = argv[i].includes('=')
                ? argv[i].slice(argv[i].indexOf('=') + 1)
                : argv[i + 1];
            Reflect.set(config, key, value);
        }
    }
    return config;
}
function replacePathIndex(path) {
    return path.replace(/\/index$/, '');
}
function toUpperCase(str) {
    return str.replace(/^[a-z]/, char => char.toUpperCase());
}
function outputFile(path, ctx) {
    writeFile(path, ctx, err => {
        console.error(err);
    });
}

function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
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
function genAbsolutePath({ path: modulePath }) {
    const getModulePath = (path) => {
        if (!isAbsolute(path)) {
            return resolve(process.cwd(), path);
        }
        return path;
    };
    if (Array.isArray(modulePath)) {
        modulePath = modulePath.map(path => getModulePath(path));
    }
    else {
        modulePath = getModulePath(modulePath);
    }
    return modulePath;
}
async function getAllFileList(path) {
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
                type: suffix
            };
            result.unshift(exportInfo);
            if (!ignoreDefaultExport.includes(suffix)) {
                result.unshift({ ...exportInfo, isDefaultExport: false });
            }
        }
    }
    return result;
}
// TODO: 命令行只能有一个 后续优化
async function bootstrap() {
    let argvConfig = argvTranslateConfig();
    const fileConfig = await loadConfigFile(argvConfig.config);
    if (fileConfig) {
        const config = fileConfig.default || {};
        argvConfig = { ...config, ...argvConfig };
    }
    if (!hasOwnProperty(argvConfig, 'path')) {
        throw new Error('path is required');
    }
    const absolutePath = genAbsolutePath(argvConfig);
    const isIgnoreIndexPath = hasOwnProperty(argvConfig, 'ignoreIndexPath');
    const getOutput = async (path) => {
        const exportMap = await getAllFileList(path);
        return output(parseModuleMap(exportMap, isIgnoreIndexPath));
    };
    if (Array.isArray(absolutePath)) {
        absolutePath.forEach(async (path) => {
            const ctx = await getOutput(path);
            const outputFilePath = join(path, argvConfig.output || 'index.ts');
            outputFile(outputFilePath, ctx);
        });
    }
    else {
        const exportStr = await getOutput(absolutePath);
        console.log(exportStr);
    }
}
bootstrap();
