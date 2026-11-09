import { rspack } from '@rspack/core'

export default {
  mode: 'development',
  entry: './src/index.js',
  plugins: [new rspack.HtmlRspackPlugin()],
}
