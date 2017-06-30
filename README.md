# 介绍

一个为 index.html 中的 js 和 css 链接增加 timestamp 参数的 webpack 插件。

在实际项目中，一般会将静态资源放在 CDN 上。假如修改了其中某一个 js 文件，则会导致 CDN 上的文件版本和生产环境的文件版本不一致，一种做法是强制刷新 CDN 上的文件缓存，比较好的做法是每次用 webpack 构建项目时，通过插件自动为index.html中的静态链接添加timestamp参数。

# 用法

在 webpack 的配置中添加本插件

```javascript
...
var StaticLinkSubstitute = require('static_link_substitute')
...
module.exports = merge(baseWebpackConfig, {
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: path.join(config.build.assetsSubDirectory, '[name].[chunkhash].js'),
    chunkFilename: path.join(config.build.assetsSubDirectory, '[id].[chunkhash].js')
  },
  vue: {
    loaders: cssLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/workflow/production.html
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    // extract css into its own file
    new ExtractTextPlugin(path.join(config.build.assetsSubDirectory, '[name].[contenthash].css')),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing'
        ? 'index.html'
        : config.build.index,
      template: 'index.html',
      inject: true,
      hash: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      }
    }),
    // 在这里添加本插件
    new StaticLinkSubstitute()
  ]
})
```