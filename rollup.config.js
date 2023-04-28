import pluginTypescript from '@rollup/plugin-typescript'
import tsConfig from './tsconfig.build.json' assert { type: 'json' }
import _resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

tsConfig.compilerOptions.declaration = false

export default {
  input: './index.ts',
  output: [
    {
      file: 'dist/bin/index.js',
      format: 'esm',
    },
  ],
  external: ['fs', 'glob'],
  plugins: [_resolve(), commonjs(), pluginTypescript(tsConfig)],
}
