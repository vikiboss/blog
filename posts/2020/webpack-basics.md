---
title: 'webpack 4.x 基础'
date: 2020-08-20
topic: '笔记'
archived: true
top_image: 'https://i.loli.net/2020/11/21/ePLUKyEQr2NDxko.jpg'
tags:
  - 'Webpack'
  - 'JavaScript'
  - '构建工具'
  - '前端'
  - '配置'
excerpt: 'Webpack 4.x 入门指南。从基础安装、配置文件编写，到 CSS/图片资源加载、HtmlWebpackPlugin 插件使用，以及 HMR 热替换和 Tree Shaking 等核心概念的简要讲解。'
---

本文简要讲解了 webpack 4.x 的入门知识，适合想了解和学习 webpack 的新手朋友。

### 引言

webpack 说白了就是一个打包工具 🔧，可以预先配置好打包设定，并约定好适用于各种不同文件类型的 loader，以及可能用到的插件 📥 等，然后其他的事情就交给 webpack，它会将你项目中的所有 JavaScript 文件、样式 🎨 文件、图片或字体资源等等打包在一起。webpack 让开发者的代码更易编写、维护的同时，也提高了生产效率。👍

### 安装

> 在开始之前，请确保安装了 [Node.js](https://nodejs.org/zh-cn/) 的较新版本

#### 全局安装

即 webpack 命令已加入环境变量，在命令行全局可用：

```bash
npm install -g webpack
npm install -g webpack-cli
```

#### 本地安装

即仅在当前项目配置 webpack 的开发环境：

```bash
npm install --save-dev webpack
npm install --save-dev webpack-cli
```

### 配置 npm 脚本

编辑项目根目录下的 `package.json` 文件。

> package.json 是 Node.js 项目的描述文件，详见 [npm 文档](https://docs.npmjs.com/files/package.json)。

```json
// package.json
"scripts": {
  "build": "webpack --config webpack.config.js"
}
```

### Webpack 配置

可以在项目根目录下创建一个 `webpack.config.js` 文件作为 webpack 的配置文件，webpack 在执行的时候会读取这个配置文件并将其作为打包的配置。更复杂的写法及功能后面会介绍到。

##### 基础配置示例

```js
// webpack.config.js
const path = require('path') // 引入 path，用来更规范地指定路径

module.exports = {
  mode: 'development', // 规定当前模式：生产模式（production）或开发模式（development）
  entry: './src/index.js', // 指定入口文件，webpack 的打包从这个文件开始
  output: {
    // 指定输出的信息：文件名、路径等
    filename: 'main.js',
    // 使用 path 来更合理地指定输出文件的路径
    path: path.resolve(__dirname, 'dist'),
  },
}
```

### 加载 CSS

##### 安装

先将 `style-loader` 和 `css-loader` 作为开发依赖安装：

```bash
npm install --save-dev style-loader css-loader
```

##### 配置

```js
// webpack.config.js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.css$/, // 使用正则对文件后缀名进行匹配，区分不同的文件
        // 在 use 数组里配置专门处理匹配到的文件类型所需的 loader
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}
```

##### 使用示例

```js
// index.js
import './style.css'

console.log('CSS file has been loaded successfully!')
```

```css
/* style.css */
.green {
  background-color: #bfa;
}
```

```html
<!-- index.html -->
<div class="green">this element's background color should be green.</div>
```

### 加载其他资源（图片、字体等）

`file-loader` 和 `url-loader` 可以接收并加载任何文件，然后将其输出到构建目录。

配置方法与加载 CSS 类似。

##### 安装

```bash
npm install --save-dev file-loader
```

##### 配置

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ['file-loader'],
      },
    ],
  },
}
```

然后就可以像引入其他模块一样引入图片和字体资源并使用了，示例如下：

```js
// index.js
import MyImage from './assets/dog.png'

const imageElement = document.createElement('img')
imageElement.src = MyImage // or imageElement.setAttribute('src', MyImage)
```

## HtmlWebpackPlugin

要引用打包好的 JavaScript 文件，一种常规且基础的方法是直接在 `index.html` 文件里引用我们打包好的文件（如下示例）。但是有时候我们要打包成很多个文件，要让它正确被引用，我们就要重新手动更改它的名字，比较麻烦。一种解决方案就是使用 `HtmlWebpackPlugin` 这个插件。

```html
<script src="main.js"></script>
```

##### 安装

```bash
npm install --save-dev html-webpack-plugin
```

##### 配置

```js
// webpack.config.js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    app: './src/index.js',
    print: './src/print.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Output Management',
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
}
```

`HtmlWebpackPlugin` 会默认生成新的 `index.html` 文件，并用新生成的 `index.html` 文件替换原来的。

### 启用观察模式

简单来说，就是修改已存在的代码时能够及时自动执行 webpack 打包命令进行更新。开启的方式很简单，加上 `--watch` 参数即可，或者在 npm 的 `scripts` 里的 webpack 相应字段中添加 `--watch`，像这样 👇

```json
// package.json
"scripts": {
  "build": "webpack --config webpack.config.js --watch"
}
```

这样 webpack 便会开启观察模式，即在检测到代码被修改的时候重新编译代码，而不会退出命令行。

### 启用 webpack-dev-server

webpack-dev-server 本质是一个基于 Node.js 的简单本地 web 服务器，能够在请求的内容发生改变时及时更新（不用手动在浏览器刷新网页）。如果你是 VSCode 用户，笔者更推荐使用 **Live Server 扩展**来达到这个目的。Live Server 的详细使用方式参考 [官方文档](https://ritwickdey.github.io/vscode-live-server/)。

##### 安装

```bash
npm install --save-dev webpack-dev-server
```

##### 配置

```js
// webpack.config.js
module.exports = {
  devServer: {
    contentBase: './dist',
  },
}
```

以上配置告知 webpack-dev-server，在 `localhost:8080` 下建立服务，并将 `dist` 目录下的文件作为可访问文件（无特殊指明，默认加载目录下的 `index.html` 文件）。

##### 添加 npm 脚本

```json
// package.json
"scripts": {
  "start": "webpack-dev-server --open"
}
```

### 启用 HMR

模块热替换（Hot Module Replacement 或 HMR）是 webpack 提供的最有用的功能之一。它允许在运行时更新各种模块，而无需进行完全刷新。

（webpack 4.x 及之后的版本貌似已经默认支持了？小声 bb）

> 前提是启用了 webpack-dev-server

##### 配置

```js
// webpack.config.js
module.exports = {
  devServer: {
    contentBase: './dist',
    hot: true, // 👈 关键在这
  },
}
```

> HMR 与观察模式的区别在于：观察模式每次在文件更改后重新编译并更新文件，而模块热替换则不重新编译，只是热替换改动的模块。

### Tree Shaking

**Tree Shaking** 是一个术语，通常用于描述移除 JavaScript 上下文中的未引用代码（dead-code）。简单来说就是在打包过程中忽略没有被使用的代码，而只打包被引用的代码，从而减小总包的大小，以提升加载速度和用户体验。

> 请注意，有些文件被 Tree Shaking 操作处理后可能会产生副作用，请确保将不确定的文件标记在副作用（`sideEffects`）列表中。

修改 `package.json` 文件，将对应文件标记为有副作用（side-effect）：

```json
// package.json
{
  "sideEffects": ["./src/some-side-effectful-file.js", "*.css"]
}
```

如果所有代码都不包含副作用，我们就可以简单地将该属性标记为 `false`，来告知 webpack，它可以安全地删除未用到的 export 导出：

```json
// package.json
{
  "sideEffects": false
}
```

其实在真正项目上线的时候，使用的是**压缩输出**模式。

只需将 `webpack.config.js` 配置文件的 `mode` 字段从 `development` 改为 `production` 即可轻松切换到**压缩输出**。

启用了 Tree Shaking 的项目在压缩输出时，webpack 不会将无关代码打包进项目。

### 脚本示例参考

```json
// package.json
"scripts": {
  "start": "webpack --config webpack.config.js --watch && webpack-dev-server --open"
}
```

### 想了解更多？🤔

参考 [webpack 官方指南](https://www.webpackjs.com/guides/)
