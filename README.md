# gencode-index-export

In `index.js`, it is always necessary to import all the files under a module (eg `export * from './foo'`).

Using this package you can parse all exported files in a certain path now support the suffix 'vue', 'ts', and' tsx '

## Usage

```shell
npm install -D @cc-heart/gen-index-export
```

create the `gen-export.config.js` file in the root path of your project project, and write to the following configuration file:

```js
import { defineConfig } from '@cc-heart/gen-index-export'
export default defineConfig({
  dirs: [{ path: 'src/components', output: 'src/components/index.ts' }],
})
```

Configure the `scripts` property in `package.json`

```js
{
    "scripts": {
    "exports": "npx gen-index-export"
  },
}
```

Use `npm run exports`, You can generate the default export items or all export items based on the directory
