import pluginTypescript from '@rollup/plugin-typescript'
import tsConfig from './tsconfig.build.json' assert { type: 'json' }
import _resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
tsConfig.compilerOptions.declaration = false

export default [
  {
    input: './index.ts',
    output: [
      {
        file: 'dist/bin/index.js',
        format: 'esm',
      },
    ],
    external: [
      'fs',
      'glob',
      '@babel/parser',
      '@babel/traverse',
      'rollup',
      '@rollup/plugin-commonjs',
      '@rollup/plugin-typescript',
      'rollup',
      'commander',
    ],
    plugins: [json(), _resolve(), commonjs(), pluginTypescript(tsConfig)],
  },
  {
    input: './src/define.ts',
    output: [
      {
        file: 'dist/define.esm.js',
        format: 'esm',
      },
    ],
    plugins: [pluginTypescript(tsConfig)],
  },
]
