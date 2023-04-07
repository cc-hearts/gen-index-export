import pluginTypescript from '@rollup/plugin-typescript'
import tsConfig from './tsconfig.build.json' assert { type: 'json' }

export default {
  input: './index.ts',
  output: [
    {
      file: 'dist/bin/index.js',
      format: 'esm',
    },
  ],
  plugins: [pluginTypescript(tsConfig)],
}
