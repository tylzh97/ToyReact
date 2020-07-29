## 初始化 & 安装基础插件 


1. mkdir toy-react 
2. npm init -y 
3. npm install webpack --save-dev 
4. npm install babel-loader @babel/core @babel/preset-env @babel/plugin-transform-react-jsx --save-dev 
## 涉及基础 


1. ES6语法 
    1. const, let等基础声明 
    2. es6模块化 
    3. promise、async 
    4. for···of等新语法 
2. webpack基础知识 
    1. 学会复制粘贴官网语法 
## 涉及网址 & 资源 


* [babel中文网在线体验](https://www.babeljs.cn/repl)
* [webpack官网](https://webpack.js.org/)
## 初始目录结构 

```plain
- toy-react 
   - dist // 该文件夹为webpack默认导出文件夹 
     main.js 
  main.js // 主文件 
  main.html // 主要 html 文件，内部手动导入 dist 文件夹中的导出文件 
  webpack.config.js // webpack 配置 
  package.json 
  ToyReact.js // 个人定义的 React 方法(就像React.createDOM) 
```
## 配置 

### webpack.config.js 

如果本机没有全局安装过webpack，在调用 webpack 命令时会报错没有安装，此时有以下几种方法： 


1. 全局安装 webpack cli，具体百度 
2. npx webpack 之后会提示你安装webpack-cli，yes 之后继续 npx webpack 
```javascript
module.exports = { 
  entry: { 
    main: "./main.js", 
  }, 
  module: { 
    rules: [ 
      { 
        test: /\.m?js$/, 
        exclude: /(node_modules|bower_components)/, 
        use: { 
          loader: "babel-loader", 
          options: { 
            presets: ["@babel/preset-env"], 
            plugins: [ 
              [ 
                "@babel/plugin-transform-react-jsx", // 解释JSX语法，转为调用方法的原始形式 
                { pragma: "ToyReact.createElement" }, // 更改调用方法名 
              ], 
            ], 
          }, 
        }, 
      }, 
    ], 
  }, 
  mode: "development", 
  optimization: { minimize: false }, 
} 

```
为了方便查看实时效果，有以下几种方法： 

1. webapck-dev-server 
2. webpack --watch 
### package.json 

```json
{ 
  "name": "toy-react", 
  "version": "1.0.0", 
  "description": "", 
  "main": "main.js", 
  "scripts": { 
    "test": "echo \"Error: no test specified\" && exit 1" 
  }, 
  "keywords": [], 
  "author": "", 
  "license": "ISC", 
  "dependencies": {}, 
  "devDependencies": { 
    "@babel/core": "^7.10.5", 
    "@babel/plugin-transform-react-jsx": "^7.10.4", 
    "@babel/preset-env": "^7.10.4", 
    "babel-loader": "^8.1.0", 
    "webpack": "^4.43.0", 
    "webpack-cli": "^3.3.12" 
  } 
} 
```

## JSX实现 

>原理说明： 
>主要使用的是原生方法：createElement 和 createTextNode 来创建 DOM 元素 
>JSX的写法 
><Custom />，此种语法 JavaScript 是不会认得，所以如果想写成这样的话，就要用 babel 转成 JavaScript 认得的东西(转成一个对象，其中包括一些属性) 
### 思路 

Babel会将我们的JSX语句转化为对象之类的数据，然后我们去判断他们是 Element node 还是Text node 

我们正常做法就是做大量的判断，判断传入值是否为原生 DOM 类型，判断传入值内是否还有其他元素(element / text)，经过一整套流程来完成将 vdom(就是jsx，本质上是JavaScript语句)转换为实DOM(真的会在网页的dom树进行渲染的) 

### 从入口开始 

由于我们想要使用JSX的语法来实现DOM操作，所以我们用了babel的plugin：plugin-transform-react-jsx，他的其中一项配置 pragma 就设定了用什么方法(function)去执行转码后的代码 

假如我们不对 pragma 进行设置，那他默认使用 React.createElement 

现在我们打算模仿 React，所以就换个自己的名字了，比如 ToyReact.createElement。所以设置 pragma: "ToyReact.createElement"。 

### createElement(type, attributes, ...children) 

>该方法是我们对原生操作的一些封装, 将经过 JSX 解析过后传进来的参数, 转化为一个真实在DOM树中出现的真实DOM 
>type 就是传进来的dom类型，如：div，span，或者自定义的 
>attributes 就是 dom 元素上的属性，如：id，class，href 等 

如果使用过React + JSX，那就知道使用中将组件分为两种。两种在经过createElement时表现是不一样的 


        1. 开头大写的自定义非原生组件 <Mycomponent /> 
            1. 进入后表现为传入一个 **引用** (非字符串)，如：f Mycomponent () 
        2. 开头小写的原生组件 <div id="haha" /> 
            1. 进入后表现为一个 **原生标签的字符串** ，如："div" 
```javascript
class MyCpomponent {} 
  
// 自定义组件 
let a = <MyCpomponent /> // babel 会对当前 JSX 语法进行分析，并且执行以下语句 
// 可以看到 createElement 第一个参数不是一个字符串,指向了上方自定义的组件 
ToyReact.createElement(MyCpomponent, { 
  id: "haha" 
}) 
// 原生组件(dom)b 
let b = <div id="haha"/> // babel 会对当前 JSX 语法进行分析，并且执行以下语句 
ToyReact.createElement("div", { 
  id: "haha" 
}); 
```
在了解后续知识点前, 先行掌握原生 DOM 的一些操作: 

1. [createElement](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createElement)MDN 
2. [createTextNode](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createTextNode)MDN 
#### 无子级无文本带属性的dom 

其实没什么说的，就是调用上面说到的原生创建 DOM 方法，然后根据传进来的 DOM类型(type)、DOM属性(attributes)进行构造实体DOM 

```javascript
ToyReact = { 
  createElement(type, attributes, ...children) { 
    // 根据 type 创建相应的 dom 实例 
    let element = document.createElement(type) 
    // 将 attributes 添加至 dom 实例 
    for (let name in attributes) { 
      element.setAttribute(name, attributes[name]) 
    } 
    return element 
  }, 
} 
```
#### 有子级无文本带属性的dom 

上面的就只是处理一层DOM，而且还不能带 Text node，要不然可能有点问题 

我们先处理有子级节点的情况 

```plain
ToyReact = { 
  createElement(type, attributes, ...children) { 
    let element = document.createElement(type) 
    for (let name in attributes) { 
      element.setAttribute(name, attributes[name]) 
    } 
    // 将子级追加到 dom 实例 
    for (let child of children) { 
      element.appendChild(child) 
    } 
    return element 
  }, 
} 
```
如果仔细看的话，就会发现 child 并没有进行 creteElement，但是还是可以添加至 dom 树，为什么呢，因为 Babel 在解析 JSX 时候，就已经每遇到一个标签就执行一遍ToyReact。createElement了 
#### 有子级有文本带属性的dom 

```javascript
ToyReact = { 
  createElement(type, attributes, ...children) { 
    // 根据 type 创建相应的 dom 实例 
    let element = document.createElement(type) 
    // 将 attributes 添加至 dom 实例 
    for (let name in attributes) { 
      element.setAttribute(name, attributes[name]) 
    } 
    // 将子级追加到 dom 实例 
    for (let child of children) { 
      // 处理 text node 情况 
      if (typeof child === "string") { 
        child = document.createTextNode(child) 
      } 
      element.appendChild(child) 
    } 
    return element 
  }, 
} 
```
### render(vdom, element) 

现在我们可以在 JSX 写原生的标签，并且渲染出来，但假如尝试自己定义的标签(开头大写的)，其实是渲染不出来的，因为DOM类型没有你传入进去的那种，现在尝试解决这个问题 

在此之前，先将Element 和 Text node 的一些方法和逻辑抽离出来 

#### class ElementWrapper{} 

这次抽象没有做额外的操作，只是将上面的操作抽离了出来 

```javascript
class ElementWrapper { 
  // 在开始时，我们根据传入 type 构建相应的 DOM 元素 
  constructor(type) { 
    this.root = document.createElement(type) 
  } 
  // 给 DOM 元素添加属性 
  setAttribute(name, value) { 
    this.root.setAttribute(name, value) 
  } 
  // 追加元素 
  appendChild(vchild) { 
    vchild.mountTo(this.root) 
  } 
  // 将元素挂载(追加)到目标元素 
  mountTo(parent) { 
    parent.appendChild(this.root) 
  } 
} 
```
#### class TexttWrapper{} 

文本节点的抽象更简短一些，因为他少了 “ **添加子元素** ”和“ **添加属性** ”两个方法 

```javascript
class TextWrapper { 
  // 文本节点的创建 
  constructor(content) { 
    this.root = document.createTextNode(content) 
  } 
  // 将文本追加至目标元素 
  mountTo(parent) { 
    parent.appendChild(this.root) 
  } 
} 
```
之后我们对 **createElement** 做出一些相应的改动 
整体看过去，其实没有什么改动，注意下一下element根据type的第一次赋值 

```javascript
createElement(type, attributes, ...children) { 
    // 根据 type 创建相应的 dom 实例 
    let element 
    // 之前说过，如果是原生 dom，传进来的 type 就会是 string 类型 
    // 如果不是原生 dom，那就是个引用的类型 
    // 我们以此为判断使用哪种容器来构造 实体dom 
    if (typeof type === "string") { 
      element = new ElementWrapper(type) 
    } 
    // 将 attributes 添加至 dom 实例 
    for (let name in attributes) { 
      element.setAttribute(name, attributes[name]) 
    } 
    // 将子级追加到 dom 实例 
    for (let child of children) { 
      // 处理 text node 情况 
      if (typeof child === "string") { 
        child = new TextWrapper(child) 
      } 
      element.appendChild(child) 
    } 

    return element 
  } 
```
现在想一想自定义的组件应该如何挂载到网页 

如果使用过React，那就知道他的自定义组件会在render时返回一个渲染内容，那渲染内容最后会变成什么样子呢，其实就是dom元素。 

假设我们现在有一个自定义组件，定义如下 

```javascript
class MyCpomponent { 
  render() { 
    return <div id="lala">cool</div> 
  } 
} 
```
不难看出，如果执行render的话，那最后其实会返回一个熟悉的原生dom，接下来补充一下上面的新 **createElement** 
添加一个自定义组件的判断 

```javascript
createElement(type, attributes, ...children) { 
    let element 
    if (typeof type === "string") { 
      element = new ElementWrapper(type) 
    } else { 
      element = new type() 
    } 
    for (let name in attributes) { 
      element.setAttribute(name, attributes[name]) 
    } 
    for (let child of children) { 
      // 处理 text node 情况 
      if (typeof child === "string") { 
        child = new TextWrapper(child) 
      } 
      element.appendChild(child) 
    } 
    return element 
  }, 
```
现在其实是有一个很大的问题的，原生的dom我们是由 **setAttribute** 等方法的，但现在自定义组件其实并没有，所以我们在对自定义组件进行一些补充 
```plain
class MyCpomponent { 
  render() { 
    console.log(1) 
    return <div id="lala">cool</div> 
  } 
  mountTo(parent) { 
    let vdom = this.render() 
    vdom.mountTo(parent) 
  } 
  setAttribute(name, value) { 
    this[name] = value 
  } 
} 
```
#### ToyReact.render(vdom, element) 

react中，我们是使用 **ReactDOM.render** 来将元素挂载到根节点的，现在实现这一步骤 

```javascript
ToyReact = { 
  render(vdom, element) { 
    vdom.mountTo(element) 
  }, 
} 
// 以下为实际调用示例 
let b = <MyCpomponent id="haha" /> 
ToyReact.render(b, document.body) 
```
上面的调用都经历了什么过程： 

1. 调用 **createElement** ，检查到并不是原生dom，创建自定义组件的实例，并对实例进行属性赋值、添加子级元素等操作 
2. 调用 **ToyReact.render** 将元素挂载(追加)到目标元素 
3. 进入 **ToyReact.render** 后调用 **vdom** 的 **mountTo** 方法，也就是 **MyCpomponent** 中的mountTo方法 
4. 之后我们遇到了自定义组件内部的 **render** ，这时候返回了我们原生dom的JSX，这就是我们一开始的步骤了 
5. 最后将处理完毕的 **实体dom** 挂载(追加，appendChild)到了 **document.body** 上 
### 
#### class Component{} 

写React时候，我们可以没有写什么 mountTo 之类的代码，而且每次都写同样的东西明显麻烦无比，所以我们把重复的东西抽离出来，不暴露给用户 

```javascript
export class Component { 
  mountTo(parent) { 
    let vdom = this.render() 
    vdom.mountTo(parent) 
  } 
  setAttribute(name, value) { 
    this[name] = value 
  } 
} 
// 实际示例 
class MyCpomponent extends Component { 
  render() { 
    return ( 
      <div id="lala"> 
        cool 
      </div> 
    ) 
  } 
} 
```
现在还有最后一点问题，我们知道React中如果标签内在插入其他标签或者表达式等，我们是可以渲染出来或者执行的，但我们现在如果这样做，他是没啥反应的还报错的 

```javascript
import { ToyReact, Component } from "./ToyReact" 
class MyCpomponent extends Component { 
  render() { 
    return ( 
      <div id="lala"> 
        <a>{true}</a> // 我们想嵌入表达式的内容 
        <div>{this.children}</div> // 我们想嵌入标签内的内容 
      </div> 
    ) 
  } 
} 
let b = ( 
  <MyCpomponent id="haha"> 
    <div>1</div> 
  </MyCpomponent> 
) 
ToyReact.render(b, document.body) 
```
那其实解析JSX时候，他碰到这个情况，会把他们搞成一个数组传入，我们根据这个来更新一下Component 
```plain
export class Component { 
  constructor() { 
    this.children = [] 
  } 
  appendChild(vchild) { 
    this.children.push(vchild) 
  } 
  mountTo(parent) { 
    let vdom = this.render() 
    vdom.mountTo(parent) 
  } 
  setAttribute(name, value) { 
    this[name] = value 
  } 
} 
```
那于此同时，我们也得修改一下createElement了 
整体的变化不大，我们只是针对子级追加进行了一步更新。如果我们现在没有更新Component的话，那现在的自定义组件是没有办法进行appenChild的 

当自定义组件引用{children}进行一个内容扩充时，他会在构建dom时传进来一个数组，此时我们来解决这个数组，具体看递归函数 **insertChildren** 

**insertChildren** 中我们进行了一些判断，主要是为了能让他们能顺利展示 

```javascript
createElement(type, attributes, ...children) { 
    // 根据 type 创建相应的 dom 实例 
    let element 
    if (typeof type === "string") { 
      element = new ElementWrapper(type) 
    } else { 
      element = new type() 
    } 
    // 将 attributes 添加至 dom 实例 
    for (let name in attributes) { 
      element.setAttribute(name, attributes[name]) 
    } 
    // 将子级追加到 dom 实例 
    let insertChildren = (children) => { 
      for (let child of children) { 
        if (typeof child === "object" && child instanceof Array) { 
          insertChildren(child) 
        } else { 
          // 只要不是属于三种节点的，都先暴力解决一下，输出字符串 
          if ( 
            !(child instanceof Component) && 
            !(child instanceof ElementWrapper) && 
            !(child instanceof TextWrapper) 
          ) { 
            child = String(child) 
          } 
          // 处理 text node 情况 
          if (typeof child === "string") { 
            child = new TextWrapper(child) 
          } 
          element.appendChild(child) 
        } 
      } 
    } 
    insertChildren(children) 

    return element 
  }, 
```