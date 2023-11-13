<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://camo.githubusercontent.com/61e102d7c605ff91efedb9d7e47c1c4a07cef59d3e1da202fd74f4772122ca4e/68747470733a2f2f766974656a732e6465762f6c6f676f2e737667">
  </a>
  <h1>Vite <span style="text-decoration: line-through; font-weight: normal">Webpack</span> Bundle Analyzer</h1>
  <p>Visualize size of Vite output files with an interactive zoomable treemap.</p>
</div>

<h2 align="center">Install</h2>

NPM:

```bash
npm install --save-dev vite-webpack-bundle-analyzer
```

Yarn:

```bash
yarn add -D vite-webpack-bundle-analyzer
```

<h2 align="center">Usage</h2>

```js
// vite.config.js
import { ViteWebpackBundleAnalyzer } from "vite-webpack-bundle-analyzer";

export default defineConfig({
    plugins: [ViteWebpackBundleAnalyzer()],
})
```

<h2 align="center">Configuration</h2>

All config based by [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) except:

1. Temporally excluded `server` value from `analyzerMode` and removed next related
   options: `analyzerHost`, `analyzerPort`, `analyzerUrl`.
2. Overrides default value for defaultSizes: from `parsed` to `stat`
3. Disabled bundle parsing by default because "webpack-bundle-analyzer" expected no module chunks. (For enabling default behavior set `enableBundleParsing: true`)
